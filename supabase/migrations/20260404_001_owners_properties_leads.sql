-- ============================================
-- Owners & Properties tables (portfolio page)
-- ============================================

CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  phtin TEXT,
  buildium_owner_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  owner_id UUID REFERENCES owners(id),
  unit_count INTEGER DEFAULT 1,
  year_built INTEGER,
  lead_paint_required BOOLEAN DEFAULT false,
  buildium_property_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for common lookups
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_owners_email ON owners(email);

-- ============================================
-- Landing page lead capture
-- ============================================

CREATE TABLE IF NOT EXISTS landing_page_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_landing_page_leads_email ON landing_page_leads(email);

-- ============================================
-- Row-level security (permissive for now — admin-only app)
-- ============================================

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_leads ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read/write (admin team)
CREATE POLICY "Authenticated users can manage owners"
  ON owners FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage properties"
  ON properties FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Landing page leads: anyone can insert, only authenticated can read
CREATE POLICY "Anyone can insert leads"
  ON landing_page_leads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read leads"
  ON landing_page_leads FOR SELECT
  USING (auth.role() = 'authenticated');
