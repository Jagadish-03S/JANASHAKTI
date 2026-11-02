-- ====================================================================
-- JANASHAKTI SEED DATA: DAVANAGERE PILOT SETUP
-- ====================================================================

-- 1. Davanagere Municipal Departments
INSERT INTO departments (id, code, name, contact_phone, contact_email, jurisdiction_description)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'ROAD', 'MCC Road & Civil Infrastructure', '+918192250101', 'roads@davanageremcc.org', 'All 45 Wards of Davanagere Mahanagara Palike'),
    ('d2222222-2222-2222-2222-222222222222', 'SWM', 'MCC Solid Waste Management & Sanitation', '+918192250102', 'sanitation@davanageremcc.org', 'City wide waste collection, cleaning, and public hygiene'),
    ('d3333333-3333-3333-3333-333333333333', 'UGD', 'MCC Water Supply & Drainage Division', '+918192250103', 'water@davanageremcc.org', 'Drinking water pipelines, pump houses, and sewage mains'),
    ('d4444444-4444-4444-4444-444444444444', 'ELEC', 'BESCOM Davanagere Electricity Circle', '+918192250104', 'bescom.dvg@karnataka.gov.in', 'Streetlights, electrical poles, and transformer safety'),
    ('d5555555-5555-5555-5555-555555555555', 'POLICE', 'Davanagere District Traffic Police', '+918192250100', 'traffic.dvg@ksp.gov.in', 'Traffic safety, accident clearance, and road hazards')
ON CONFLICT (code) DO NOTHING;

-- 2. Core Users (Admin, Officer, Citizen, Volunteer)
-- Default password: Password@123 ($2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G)
INSERT INTO users (id, full_name, email, phone_number, password_hash, role, department_id, is_verified)
VALUES
    ('u1111111-1111-1111-1111-111111111111', 'Davanagere System Admin', 'admin@janashakti.gov.in', '+919845012345', '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G', 'ADMIN', NULL, TRUE),
    ('u2222222-2222-2222-2222-222222222222', 'MCC Ward Control Officer', 'officer@mcc.gov.in', '+919845054321', '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G', 'AUTHORITY', 'd1111111-1111-1111-1111-111111111111', TRUE),
    ('u3333333-3333-3333-3333-333333333333', 'Ramesh Kumar', 'ramesh.cit@example.com', '+919845099887', '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G', 'CITIZEN', NULL, TRUE),
    ('u4444444-4444-4444-4444-444444444444', 'Priya Sharma', 'priya.vol@example.com', '+919845077665', '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G', 'VOLUNTEER', NULL, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 3. Pilot Incidents with PostGIS ST_SetSRID(ST_MakePoint(lng, lat), 4326)
INSERT INTO incidents (
    id, incident_number, reporter_id, title, description, category, priority, status,
    exact_location, public_location, landmark_address, ward_id, assigned_department_id, assigned_officer_id, upvotes_count
) VALUES
(
    'i1111111-1111-1111-1111-111111111111',
    'DVG-2026-0001',
    'u3333333-3333-3333-3333-333333333333',
    'Deep Pot-hole near Hadadi Road Junction',
    'Major road hazard causing 2-wheeler skidding near Hadadi road bridge junction. Immediate asphalt patching needed.',
    'ROAD_HAZARD',
    'HIGH',
    'UNDER_AUTHORITY_REVIEW',
    ST_SetSRID(ST_MakePoint(75.9234, 14.4678), 4326),
    ST_SetSRID(ST_MakePoint(75.9240, 14.4682), 4326),
    'Opposite Bapuji Dental College, Hadadi Road, Davanagere',
    12,
    'd1111111-1111-1111-1111-111111111111',
    'u2222222-2222-2222-2222-222222222222',
    7
),
(
    'i2222222-2222-2222-2222-222222222222',
    'DVG-2026-0002',
    'u3333333-3333-3333-3333-333333333333',
    'Water Main Leakage flooding footpath',
    'Drinking water pipeline ruptured on MCC B Block 4th Main road. Clean water flooding streets since early morning.',
    'WATER_LEAKAGE',
    'MEDIUM',
    'OFFICIALLY_VERIFIED',
    ST_SetSRID(ST_MakePoint(75.9180, 14.4590), 4326),
    ST_SetSRID(ST_MakePoint(75.9185, 14.4595), 4326),
    'Near Gandhi Park, MCC B Block, Davanagere',
    8,
    'd3333333-3333-3333-3333-333333333333',
    NULL,
    14
)
ON CONFLICT (incident_number) DO NOTHING;

