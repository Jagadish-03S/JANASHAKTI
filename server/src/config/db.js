/**
 * Database Connection & Adaptor (PostgreSQL + PostGIS with in-memory fallback)
 */

const { Pool } = require('pg');
const env = require('./env');
const logger = require('../utils/logger');
const { ROLES, INCIDENT_STATUSES, INCIDENT_CATEGORIES, INCIDENT_PRIORITIES } = require('./constants');

let pool = null;
let isPostgresConnected = false;

// In-Memory Database Store for robust local development/testing without live DB
const memoryStore = {
  users: [
    {
      id: 'usr-admin-1',
      full_name: 'Davanagere System Administrator',
      email: 'admin@janashakti.gov.in',
      phone_number: '+919845012345',
      // Password: Password@123 (bcrypt hash)
      password_hash: '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G',
      role: ROLES.ADMIN,
      is_verified: true,
      created_at: new Date('2026-01-01T00:00:00Z'),
    },
    {
      id: 'usr-auth-1',
      full_name: 'MCC Ward Control Officer',
      email: 'officer@mcc.gov.in',
      phone_number: '+919845054321',
      password_hash: '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G',
      role: ROLES.AUTHORITY,
      department_id: 'dept-mcc-roads',
      is_verified: true,
      created_at: new Date('2026-01-05T00:00:00Z'),
    },
    {
      id: 'usr-cit-1',
      full_name: 'Ramesh Kumar (Citizen)',
      email: 'ramesh.cit@example.com',
      phone_number: '+919845099887',
      password_hash: '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G',
      role: ROLES.CITIZEN,
      is_verified: true,
      created_at: new Date('2026-01-10T00:00:00Z'),
    },
    {
      id: 'usr-vol-1',
      full_name: 'Priya Sharma (Volunteer)',
      email: 'priya.vol@example.com',
      phone_number: '+919845077665',
      password_hash: '$2a$10$wT55Yp5Rz3eK13m20fH9UeM.Bw9.bqvN3t9g0zGZ9x.5Z8a1X2d.G',
      role: ROLES.VOLUNTEER,
      is_verified: true,
      created_at: new Date('2026-01-12T00:00:00Z'),
    },
  ],
  incidents: [
    {
      id: 'inc-dvg-001',
      incident_number: 'DVG-2026-0001',
      reporter_id: 'usr-cit-1',
      reporter_name: 'Ramesh Kumar',
      reporter_phone: '+919845099887',
      title: 'Deep Pot-hole near Hadadi Road Junction',
      description: 'Major road hazard causing 2-wheeler skidding near Hadadi road bridge junction. Immediate asphalt patching needed.',
      category: INCIDENT_CATEGORIES.ROAD_HAZARD,
      priority: INCIDENT_PRIORITIES.HIGH,
      status: INCIDENT_STATUSES.UNDER_AUTHORITY_REVIEW,
      exact_lat: 14.4678,
      exact_lng: 75.9234,
      public_lat: 14.4682,
      public_lng: 75.9240,
      landmark_address: 'Opposite Bapuji Dental College, Hadadi Road, Davanagere',
      ward_id: 12,
      assigned_department_id: 'dept-mcc-roads',
      assigned_officer_id: 'usr-auth-1',
      upvotes_count: 7,
      created_at: new Date('2026-11-01T09:30:00Z'),
      updated_at: new Date('2026-11-01T11:00:00Z'),
      media: [
        {
          id: 'med-1',
          file_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
          file_type: 'image/jpeg',
          caption: 'Road surface cave-in',
        },
      ],
    },
    {
      id: 'inc-dvg-002',
      incident_number: 'DVG-2026-0002',
      reporter_id: 'usr-cit-1',
      reporter_name: 'Ramesh Kumar',
      reporter_phone: '+919845099887',
      title: 'Water Main Leakage flooding footpath',
      description: 'Drinking water pipeline ruptured on MCC B Block 4th Main road. Clean water flooding streets since early morning.',
      category: INCIDENT_CATEGORIES.WATER_LEAKAGE,
      priority: INCIDENT_PRIORITIES.MEDIUM,
      status: INCIDENT_STATUSES.OFFICIALLY_VERIFIED,
      exact_lat: 14.4590,
      exact_lng: 75.9180,
      public_lat: 14.4595,
      public_lng: 75.9185,
      landmark_address: 'Near Gandhi Park, MCC B Block, Davanagere',
      ward_id: 8,
      assigned_department_id: 'dept-mcc-water',
      assigned_officer_id: null,
      upvotes_count: 14,
      created_at: new Date('2026-11-01T14:15:00Z'),
      updated_at: new Date('2026-11-01T15:00:00Z'),
      media: [],
    },
    {
      id: 'inc-dvg-003',
      incident_number: 'DVG-2026-0003',
      reporter_id: 'usr-cit-1',
      reporter_name: 'Ramesh Kumar',
      reporter_phone: '+919845099887',
      title: 'Flickering Streetlights in Vidyanagar Main Street',
      description: 'Four consecutive LED streetlights are defective, creating a blind spot for pedestrians after 7 PM.',
      category: INCIDENT_CATEGORIES.STREETLIGHT,
      priority: INCIDENT_PRIORITIES.LOW,
      status: INCIDENT_STATUSES.IN_PROGRESS,
      exact_lat: 14.4720,
      exact_lng: 75.9310,
      public_lat: 14.4725,
      public_lng: 75.9315,
      landmark_address: 'Vidyanagar 7th Cross, Davanagere',
      ward_id: 21,
      assigned_department_id: 'dept-bescom',
      assigned_officer_id: 'usr-auth-1',
      upvotes_count: 3,
      created_at: new Date('2026-10-31T18:00:00Z'),
      updated_at: new Date('2026-11-01T08:00:00Z'),
      media: [],
    },
  ],
  auditLogs: [],
};

async function initDatabase() {
  if (process.env.SKIP_DB === 'true') {
    logger.info('Database check skipped via SKIP_DB=true. Utilizing in-memory data store.');
    return;
  }

  try {
    pool = new Pool({
      host: env.DB.HOST,
      port: env.DB.PORT,
      database: env.DB.NAME,
      user: env.DB.USER,
      password: env.DB.PASSWORD,
      ssl: env.DB.SSL ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 3000,
    });

    const client = await pool.connect();
    const res = await client.query('SELECT version();');
    client.release();
    isPostgresConnected = true;
    logger.info(`Connected to PostgreSQL: ${res.rows[0].version}`);
  } catch (err) {
    logger.warn(`PostgreSQL connection unavailable (${err.message}). Using high-fidelity in-memory civic store for development.`);
    isPostgresConnected = false;
  }
}

function getDbStatus() {
  return {
    engine: isPostgresConnected ? 'PostgreSQL + PostGIS' : 'In-Memory Fallback Engine',
    connected: isPostgresConnected,
    host: env.DB.HOST,
    database: env.DB.NAME,
    cachedIncidents: memoryStore.incidents.length,
    cachedUsers: memoryStore.users.length,
  };
}

module.exports = {
  pool,
  initDatabase,
  getDbStatus,
  memoryStore,
};

