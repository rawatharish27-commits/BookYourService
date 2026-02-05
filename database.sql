
-- ... (existing schema)

-- ==========================================
-- 11. ADMIN AUDIT SYSTEM (PHASE 7)
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL, -- e.g., 'APPROVE_SERVICE', 'BLOCK_USER', 'RESOLVE_DISPUTE'
    target_type VARCHAR(50) NOT NULL,  -- e.g., 'SERVICE', 'USER', 'BOOKING'
    target_id UUID NOT NULL,
    payload JSONB,                    -- Stores what was changed (old vs new values)
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_type ON admin_audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_target ON admin_audit_logs(target_id);

-- ==========================================
-- 12. FULL-TEXT SEARCH INFRA (PHASE 8)
-- ==========================================
-- Add search vector columns to catalog and services for sub-second lookup
ALTER TABLE service_templates ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create update triggers to keep vectors in sync automatically
CREATE OR REPLACE FUNCTION update_search_vectors() RETURNS trigger AS $$
BEGIN
  IF TG_TABLE_NAME = 'service_templates' THEN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') || 
                         setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  ELSIF TG_TABLE_NAME = 'categories' THEN
    NEW.search_vector := setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') || 
                         setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B');
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tsvectorupdate ON service_templates;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON service_templates
FOR EACH ROW EXECUTE FUNCTION update_search_vectors();

DROP TRIGGER IF EXISTS tsvectorupdate ON categories;
CREATE TRIGGER tsvectorupdate BEFORE INSERT OR UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_search_vectors();

-- GIN Index for fast searching
CREATE INDEX IF NOT EXISTS idx_templates_search ON service_templates USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_categories_search ON categories USING GIN(search_vector);
