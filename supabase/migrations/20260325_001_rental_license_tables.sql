-- ============================================
-- Rental License Application Tables
-- ============================================

-- Application status enum
CREATE TYPE rental_license_status AS ENUM (
  'pending_payment',    -- Step 1 submitted, waiting on Stripe payment
  'paid',               -- Payment received, waiting on Step 2 form
  'intake_complete',    -- Step 2 form submitted, ready to start processing
  'awaiting_phtin',     -- Blocked — waiting on owner for Philadelphia Tax ID
  'in_progress',        -- Moving through compliance/licensing steps
  'blocked',            -- Blocked by violations, tax issues, etc.
  'ready_to_submit',    -- All prerequisites met, ready for Eclipse submission
  'submitted',          -- Submitted in Eclipse, waiting on L&I
  'completed'           -- License issued
);

-- Service type enum
CREATE TYPE service_type AS ENUM (
  'managed',        -- Full management client (billing through Buildium)
  'license_only',   -- Standalone rental license service (Stripe payment)
  'leasing_only'    -- Tenant placement + license ($250 fee)
);

-- Title type enum
CREATE TYPE title_type AS ENUM (
  'personal',   -- In your name
  'llc',        -- LLC
  'other'       -- Other entity
);

-- ============================================
-- Main application table
-- ============================================
CREATE TABLE rental_license_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Step 1: Pricing info (collected before payment)
  property_address TEXT NOT NULL,
  unit_count INTEGER NOT NULL,
  year_built INTEGER,                          -- From OPA API lookup
  lead_paint_required BOOLEAN DEFAULT false,   -- true if year_built <= 1978
  service_type service_type NOT NULL DEFAULT 'license_only',

  -- Pricing breakdown (calculated server-side)
  service_fee_cents INTEGER NOT NULL DEFAULT 50000,      -- $500.00
  license_fee_cents INTEGER NOT NULL DEFAULT 0,          -- $69 × units
  lead_paint_fee_cents INTEGER NOT NULL DEFAULT 0,       -- Sum of per-unit lead paint costs
  total_cents INTEGER NOT NULL DEFAULT 0,                -- Grand total

  -- Stripe payment
  stripe_checkout_session_id TEXT,
  stripe_payment_intent_id TEXT,
  paid_at TIMESTAMPTZ,

  -- Step 2: Owner details (collected after payment)
  owner_first_name TEXT,
  owner_last_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  owner_dob DATE,
  owner_mailing_address TEXT,
  title_type title_type,
  has_phtin BOOLEAN,
  phtin TEXT,
  has_lead_paint_test BOOLEAN,
  has_commercial_activity_license BOOLEAN,
  property_access_notes TEXT,
  units_occupied BOOLEAN,
  has_natural_gas BOOLEAN,

  -- Workflow tracking
  status rental_license_status NOT NULL DEFAULT 'pending_payment',
  current_step INTEGER DEFAULT 0,

  -- Compliance snapshot (stored after city API check)
  compliance_report JSONB,
  compliance_checked_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Per-unit details (bedrooms drive lead paint pricing)
-- ============================================
CREATE TABLE application_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES rental_license_applications(id) ON DELETE CASCADE,
  unit_label TEXT NOT NULL,                    -- e.g., "Unit 1", "Unit 2", "Entire Property"
  bedroom_count INTEGER NOT NULL,             -- 0 = studio
  lead_paint_fee_cents INTEGER DEFAULT 0,     -- Per-unit lead paint test cost

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_units_app_id ON application_units(application_id);

-- ============================================
-- Workflow steps (tracks the 10-step process per application)
-- ============================================
CREATE TYPE step_status AS ENUM ('pending', 'active', 'completed', 'blocked', 'skipped');

CREATE TABLE application_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES rental_license_applications(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  status step_status NOT NULL DEFAULT 'pending',
  blocker_reason TEXT,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(application_id, step_number)
);

CREATE INDEX idx_application_steps_app_id ON application_steps(application_id);

-- ============================================
-- Activity log / notes
-- ============================================
CREATE TABLE application_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES rental_license_applications(id) ON DELETE CASCADE,
  author TEXT NOT NULL,                        -- "System", "Rental License Coordinator", etc.
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,             -- true for automated entries

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_notes_app_id ON application_notes(application_id);

-- ============================================
-- File uploads (photo ID, CAL, settlement sheet, etc.)
-- ============================================
CREATE TABLE application_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES rental_license_applications(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL,                     -- 'photo_id', 'cal', 'settlement_sheet', 'expired_license'
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,                  -- Supabase Storage path
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_application_files_app_id ON application_files(application_id);

-- ============================================
-- Auto-update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON rental_license_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_steps_updated_at
  BEFORE UPDATE ON application_steps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
