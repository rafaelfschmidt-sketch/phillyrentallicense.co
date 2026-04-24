-- ============================================
-- Landing page leads: add quiz + variant tracking
-- ============================================

ALTER TABLE landing_page_leads
  ADD COLUMN IF NOT EXISTS quiz_result TEXT,
  ADD COLUMN IF NOT EXISTS variant TEXT,
  ADD COLUMN IF NOT EXISTS source_domain TEXT,
  ADD COLUMN IF NOT EXISTS source_tool TEXT,
  ADD COLUMN IF NOT EXISTS year_built INTEGER,
  ADD COLUMN IF NOT EXISTS unit_count INTEGER,
  ADD COLUMN IF NOT EXISTS estimated_total_cents INTEGER;

CREATE INDEX IF NOT EXISTS idx_landing_page_leads_quiz_result
  ON landing_page_leads(quiz_result);

CREATE INDEX IF NOT EXISTS idx_landing_page_leads_variant
  ON landing_page_leads(variant);

CREATE INDEX IF NOT EXISTS idx_landing_page_leads_source_domain
  ON landing_page_leads(source_domain);
