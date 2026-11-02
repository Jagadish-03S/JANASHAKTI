const { getDbStatus } = require('../config/db');
const { DAVANAGERE_METADATA } = require('../config/constants');

const startTime = Date.now();

function getHealth(req, res) {
  const dbStatus = getDbStatus();

  res.status(200).json({
    success: true,
    platform: 'JANASHAKTI Civic Safety & Incident Platform',
    version: '1.0.0-phase1',
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    pilotDeployment: {
      city: DAVANAGERE_METADATA.CITY_NAME,
      state: DAVANAGERE_METADATA.STATE,
      coordinates: DAVANAGERE_METADATA.CENTER_COORDINATES,
      municipality: DAVANAGERE_METADATA.PILOT_MUNICIPALITY,
      totalWards: DAVANAGERE_METADATA.TOTAL_WARDS,
    },
    database: dbStatus,
    activeModules: [
      { id: 1, name: 'Project Structure & Architecture', status: 'COMPLETE' },
      { id: 2, name: 'Landing Page & Authentication', status: 'COMPLETE' },
      { id: 3, name: 'Citizen Dashboard & Reporting', status: 'COMPLETE' },
      { id: 4, name: 'PostgreSQL + PostGIS', status: 'COMPLETE' },
      { id: 5, name: 'Interactive Live Map', status: 'COMPLETE' },
      { id: 6, name: 'Socket.IO Live Updates', status: 'COMPLETE' },
      { id: 7, name: 'Authority Verification Dashboard', status: 'COMPLETE' },
      { id: 8, name: 'AI Incident Classification', status: 'COMPLETE' },
      { id: 9, name: 'Notifications Dispatch', status: 'COMPLETE' },
      { id: 10, name: 'Test & Production Packaging', status: 'COMPLETE' },
    ],
  });
}

function getPilotInfo(req, res) {
  res.status(200).json({
    success: true,
    data: DAVANAGERE_METADATA,
  });
}

module.exports = {
  getHealth,
  getPilotInfo,
};

