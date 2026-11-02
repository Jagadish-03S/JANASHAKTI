-- ====================================================================
-- JANASHAKTI MIGRATION 002: SPATIAL INDEXES & POSTGIS ACCELERATION
-- ====================================================================

-- GiST Indexes for PostGIS ST_DWithin and bounding box filtering
CREATE INDEX IF NOT EXISTS idx_incidents_exact_geom ON incidents USING GIST (exact_location);
CREATE INDEX IF NOT EXISTS idx_incidents_public_geom ON incidents USING GIST (public_location);

-- B-Tree Indexes for rapid filtering and lookup
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents (status);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents (category);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents (priority);
CREATE INDEX IF NOT EXISTS idx_incidents_ward_id ON incidents (ward_id);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users (role);
CREATE INDEX IF NOT EXISTS idx_status_logs_incident ON incident_status_logs (incident_id);

