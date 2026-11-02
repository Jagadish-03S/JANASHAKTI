-- ====================================================================
-- JANASHAKTI MIGRATION 001: INITIAL RELATIONAL & SPATIAL SCHEMA
-- Pilot City: Davanagere, Karnataka, India
-- ====================================================================

-- 1. Enable PostGIS and UUID Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('CITIZEN', 'VOLUNTEER', 'AUTHORITY', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_status AS ENUM (
        'UNVERIFIED',
        'COMMUNITY_CONFIRMED',
        'UNDER_AUTHORITY_REVIEW',
        'OFFICIALLY_VERIFIED',
        'IN_PROGRESS',
        'RESOLVED',
        'REJECTED',
        'DUPLICATE'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_category AS ENUM (
        'ROAD_HAZARD',
        'STREETLIGHT',
        'WATER_LEAKAGE',
        'GARBAGE_DUMP',
        'ACCIDENT',
        'FIRE_SAFETY',
        'PUBLIC_NUISANCE',
        'SEWAGE_OVERFLOW',
        'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE incident_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Departments Table (Civic Bodies in Davanagere)
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(100),
    jurisdiction_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(25) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'CITIZEN',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    fcm_device_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Incidents Table (with PostGIS Geometry)
CREATE TABLE IF NOT EXISTS incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category incident_category NOT NULL DEFAULT 'OTHER',
    priority incident_priority NOT NULL DEFAULT 'MEDIUM',
    status incident_status NOT NULL DEFAULT 'UNVERIFIED',
    
    -- Spatial Geometries (SRID 4326: WGS 84 GPS coordinates)
    exact_location GEOMETRY(Point, 4326) NOT NULL,
    public_location GEOMETRY(Point, 4326) NOT NULL,
    
    landmark_address TEXT,
    ward_id INTEGER NOT NULL CHECK (ward_id >= 1 AND ward_id <= 45),
    assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    assigned_officer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    upvotes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Incident Media / Attachments
CREATE TABLE IF NOT EXISTS incident_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT,
    caption VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Community Confirmations (Vouching)
CREATE TABLE IF NOT EXISTS incident_confirmations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(incident_id, user_id)
);

-- 8. Status History & Audit Trail
CREATE TABLE IF NOT EXISTS incident_status_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    previous_status incident_status,
    new_status incident_status NOT NULL,
    remarks TEXT,
    proof_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. System Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

