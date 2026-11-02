/**
 * JANASHAKTI System Constants
 * Pilot Deployment: Davanagere, Karnataka, India
 */

const ROLES = {
  CITIZEN: 'CITIZEN',
  VOLUNTEER: 'VOLUNTEER',
  AUTHORITY: 'AUTHORITY',
  ADMIN: 'ADMIN',
};

const INCIDENT_STATUSES = {
  UNVERIFIED: 'UNVERIFIED',
  COMMUNITY_CONFIRMED: 'COMMUNITY_CONFIRMED',
  UNDER_AUTHORITY_REVIEW: 'UNDER_AUTHORITY_REVIEW',
  OFFICIALLY_VERIFIED: 'OFFICIALLY_VERIFIED',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  DUPLICATE: 'DUPLICATE',
};

const INCIDENT_CATEGORIES = {
  ROAD_HAZARD: 'ROAD_HAZARD',
  STREETLIGHT: 'STREETLIGHT',
  WATER_LEAKAGE: 'WATER_LEAKAGE',
  GARBAGE_DUMP: 'GARBAGE_DUMP',
  ACCIDENT: 'ACCIDENT',
  FIRE_SAFETY: 'FIRE_SAFETY',
  PUBLIC_NUISANCE: 'PUBLIC_NUISANCE',
  SEWAGE_OVERFLOW: 'SEWAGE_OVERFLOW',
  OTHER: 'OTHER',
};

const INCIDENT_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

const DAVANAGERE_METADATA = {
  CITY_NAME: 'Davanagere',
  STATE: 'Karnataka',
  COUNTRY: 'India',
  CENTER_COORDINATES: {
    lat: 14.4644,
    lng: 75.9218,
  },
  BOUNDS: {
    minLat: 14.4100,
    maxLat: 14.5200,
    minLng: 75.8700,
    maxLng: 75.9700,
  },
  DEFAULT_ZOOM: 13,
  TOTAL_WARDS: 45,
  PILOT_MUNICIPALITY: 'Davanagere City Corporation (Mahanagara Palike)',
  DEPARTMENTS: [
    { id: 'dept-mcc-roads', name: 'MCC Road & Infrastructure Works', code: 'ROAD' },
    { id: 'dept-mcc-sanitation', name: 'MCC Solid Waste Management & Health', code: 'SWM' },
    { id: 'dept-mcc-water', name: 'MCC Water Supply & Underground Drainage', code: 'UGD' },
    { id: 'dept-bescom', name: 'BESCOM Davanagere Electricity Division', code: 'ELEC' },
    { id: 'dept-police', name: 'Davanagere District Police Traffic & Safety', code: 'POLICE' },
    { id: 'dept-fire', name: 'Karnataka Fire & Emergency Services Davanagere', code: 'FIRE' },
  ],
};

module.exports = {
  ROLES,
  INCIDENT_STATUSES,
  INCIDENT_CATEGORIES,
  INCIDENT_PRIORITIES,
  DAVANAGERE_METADATA,
};

