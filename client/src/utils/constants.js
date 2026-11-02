export const ROLES = {
  CITIZEN: 'CITIZEN',
  VOLUNTEER: 'VOLUNTEER',
  AUTHORITY: 'AUTHORITY',
  ADMIN: 'ADMIN',
};

export const INCIDENT_STATUSES = {
  UNVERIFIED: {
    key: 'UNVERIFIED',
    label: 'Unverified',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  COMMUNITY_CONFIRMED: {
    key: 'COMMUNITY_CONFIRMED',
    label: 'Community Confirmed',
    color: 'bg-sky-50 text-sky-800 border-sky-200',
    dot: 'bg-sky-500',
  },
  UNDER_AUTHORITY_REVIEW: {
    key: 'UNDER_AUTHORITY_REVIEW',
    label: 'Under Authority Review',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  OFFICIALLY_VERIFIED: {
    key: 'OFFICIALLY_VERIFIED',
    label: 'Officially Verified',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
    dot: 'bg-teal-500',
  },
  IN_PROGRESS: {
    key: 'IN_PROGRESS',
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-600',
  },
  RESOLVED: {
    key: 'RESOLVED',
    label: 'Resolved',
    color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
  REJECTED: {
    key: 'REJECTED',
    label: 'Rejected',
    color: 'bg-rose-50 text-rose-800 border-rose-200',
    dot: 'bg-rose-500',
  },
  DUPLICATE: {
    key: 'DUPLICATE',
    label: 'Duplicate',
    color: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-400',
  },
};

export const INCIDENT_CATEGORIES = {
  ROAD_HAZARD: { key: 'ROAD_HAZARD', label: 'Road Hazard & Potholes', icon: 'AlertTriangle' },
  STREETLIGHT: { key: 'STREETLIGHT', label: 'Defective Streetlight', icon: 'Lightbulb' },
  WATER_LEAKAGE: { key: 'WATER_LEAKAGE', label: 'Drinking Water Leakage', icon: 'Droplets' },
  GARBAGE_DUMP: { key: 'GARBAGE_DUMP', label: 'Illegal Garbage Dump', icon: 'Trash2' },
  ACCIDENT: { key: 'ACCIDENT', label: 'Traffic & Vehicle Accident', icon: 'Car' },
  FIRE_SAFETY: { key: 'FIRE_SAFETY', label: 'Fire & Thermal Hazard', icon: 'Flame' },
  PUBLIC_NUISANCE: { key: 'PUBLIC_NUISANCE', label: 'Public Nuisance & Safety', icon: 'ShieldAlert' },
  SEWAGE_OVERFLOW: { key: 'SEWAGE_OVERFLOW', label: 'Sewage / Drainage Overflow', icon: 'Waves' },
  OTHER: { key: 'OTHER', label: 'General Civic Issue', icon: 'HelpCircle' },
};

export const INCIDENT_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
};

export const PILOT_COORDINATES = {
  lat: 14.4644,
  lng: 75.9218,
  zoom: 13,
  city: 'Davanagere',
  state: 'Karnataka',
};
