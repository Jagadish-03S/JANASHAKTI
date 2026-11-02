const express = require('express');
const router = express.Router();
const {
  getIncidents,
  getNearbyIncidents,
  getMyIncidents,
  getIncidentById,
  createIncident,
  vouchIncident,
  addComment,
} = require('../controllers/incident.controller');
const { optionalAuth, authenticateToken } = require('../middleware/auth.middleware');
const { reportLimiter } = require('../middleware/rateLimiter.middleware');
const upload = require('../middleware/upload.middleware');

// Public feed (optionalAuth masks PII for general public)
router.get('/', optionalAuth, getIncidents);
router.get('/nearby', optionalAuth, getNearbyIncidents);
router.get('/my-reports', authenticateToken, getMyIncidents);
router.get('/:id', optionalAuth, getIncidentById);

// Reporting (photo upload + rate limiting)
router.post('/', reportLimiter, optionalAuth, upload.array('photos', 4), createIncident);

// Vouching & community updates
router.post('/:id/vouch', authenticateToken, vouchIncident);
router.post('/:id/comments', authenticateToken, addComment);

module.exports = router;
