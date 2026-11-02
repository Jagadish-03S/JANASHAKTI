const { v4: uuidv4 } = require('uuid');
const { memoryStore, pool } = require('../config/db');
const {
  INCIDENT_STATUSES,
  INCIDENT_CATEGORIES,
  INCIDENT_PRIORITIES,
  ROLES,
} = require('../config/constants');
const { isWithinDavanagereBounds, coarsenCoordinates, getDistanceInMeters } = require('../utils/geoUtils');
const { sanitizeIncidentForViewer } = require('../utils/privacyMasker');
const { classifyIncidentAI, findPotentialDuplicates } = require('../services/aiService');
const { broadcastNearbyAlert, sendNotification } = require('../services/fcmService');

let incidentCounter = 10;

/**
 * 1. GET /api/incidents
 * List all public incidents with role-based privacy masking
 */
function getIncidents(req, res) {
  const viewerRole = req.user ? req.user.role : null;
  const viewerId = req.user ? req.user.id : null;
  const { status, category, ward, search, priority } = req.query;

  let results = [...memoryStore.incidents];

  if (status && status !== 'ALL') {
    results = results.filter(i => i.status === status);
  }
  if (category && category !== 'ALL') {
    results = results.filter(i => i.category === category);
  }
  if (priority && priority !== 'ALL') {
    results = results.filter(i => i.priority === priority);
  }
  if (ward && ward !== 'ALL') {
    results = results.filter(i => String(i.ward_id) === String(ward));
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.incident_number.toLowerCase().includes(q) ||
        (i.landmark_address && i.landmark_address.toLowerCase().includes(q))
    );
  }

  // Sort descending by created_at
  results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Sanitize according to viewer role (mask PII and coarsen location for public)
  const sanitizedResults = results.map(i => sanitizeIncidentForViewer(i, viewerRole, viewerId));

  res.status(200).json({
    success: true,
    count: sanitizedResults.length,
    data: sanitizedResults,
  });
}

/**
 * 2. GET /api/incidents/nearby
 * Spatial query returning incidents within radiusMeters (PostGIS or Haversine fallback)
 */
function getNearbyIncidents(req, res) {
  const { lat, lng, radius = 2500 } = req.query;
  const viewerRole = req.user ? req.user.role : null;
  const viewerId = req.user ? req.user.id : null;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and Longitude query parameters are required for nearby spatial queries.',
    });
  }

  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const radiusNum = parseFloat(radius);

  const nearby = memoryStore.incidents
    .map(i => {
      const distance = getDistanceInMeters(userLat, userLng, i.exact_lat || i.latitude, i.exact_lng || i.longitude);
      return { ...i, distanceMeters: Math.round(distance) };
    })
    .filter(i => i.distanceMeters <= radiusNum)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const sanitized = nearby.map(i => sanitizeIncidentForViewer(i, viewerRole, viewerId));

  res.status(200).json({
    success: true,
    center: { lat: userLat, lng: userLng },
    radiusMeters: radiusNum,
    count: sanitized.length,
    data: sanitized,
  });
}

/**
 * 3. GET /api/incidents/my-reports
 * Returns authenticated user's submitted incidents with full history
 */
function getMyIncidents(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const myReports = memoryStore.incidents
    .filter(i => i.reporter_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Reporter can see exact coordinates of their own reports
  const sanitized = myReports.map(i => sanitizeIncidentForViewer(i, req.user.role, req.user.id));

  res.status(200).json({
    success: true,
    count: sanitized.length,
    data: sanitized,
  });
}

/**
 * 4. GET /api/incidents/:id
 */
function getIncidentById(req, res) {
  const { id } = req.params;
  const viewerRole = req.user ? req.user.role : null;
  const viewerId = req.user ? req.user.id : null;

  const incident = memoryStore.incidents.find(i => i.id === id || i.incident_number === id);
  if (!incident) {
    return res.status(404).json({
      success: false,
      message: `Incident '${id}' not found.`,
    });
  }

  const sanitized = sanitizeIncidentForViewer(incident, viewerRole, viewerId);

  res.status(200).json({
    success: true,
    data: sanitized,
  });
}

/**
 * 5. POST /api/incidents
 * Create new incident with photo uploads, AI advisory classification, and live socket broadcast
 */
async function createIncident(req, res) {
  const {
    title,
    description,
    category = INCIDENT_CATEGORIES.OTHER,
    priority = INCIDENT_PRIORITIES.MEDIUM,
    latitude,
    longitude,
    landmarkAddress,
    wardId,
  } = req.body;

  if (!title || !description || latitude === undefined || longitude === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Title, description, latitude, and longitude are mandatory.',
    });
  }

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);

  if (isNaN(latNum) || isNaN(lngNum)) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and Longitude must be valid decimal numbers.',
    });
  }

  const inBounds = isWithinDavanagereBounds(latNum, lngNum);
  const formattedNum = `DVG-2026-${String(incidentCounter++).padStart(4, '0')}`;
  const publicCoords = coarsenCoordinates(latNum, lngNum);

  // File uploads
  const media = [];
  if (req.files && Array.isArray(req.files)) {
    req.files.forEach(f => {
      media.push({
        id: `med-${uuidv4().substring(0, 8)}`,
        file_url: `/uploads/${f.filename}`,
        file_type: f.mimetype,
        file_size_bytes: f.size,
        uploaded_at: new Date(),
      });
    });
  }

  // AI Advisory Classification (Never official verification)
  const aiTriage = await classifyIncidentAI(title, description, latNum, lngNum);
  const potentialDuplicates = findPotentialDuplicates(title, latNum, lngNum, memoryStore.incidents);

  const newIncident = {
    id: `inc-${uuidv4().substring(0, 8)}`,
    incident_number: formattedNum,
    reporter_id: req.user ? req.user.id : 'usr-cit-anonymous',
    reporter_name: req.user ? req.user.fullName : 'Anonymous Citizen',
    reporter_phone: req.user ? req.user.phoneNumber : null,
    reporter_email: req.user ? req.user.email : null,
    title: title.trim(),
    description: description.trim(),
    category: INCIDENT_CATEGORIES[category] || aiTriage.suggestedCategory || INCIDENT_CATEGORIES.OTHER,
    priority: INCIDENT_PRIORITIES[priority] || aiTriage.suggestedPriority || INCIDENT_PRIORITIES.MEDIUM,
    status: INCIDENT_STATUSES.UNVERIFIED,
    exact_lat: latNum,
    exact_lng: lngNum,
    public_lat: publicCoords.lat,
    public_lng: publicCoords.lng,
    landmark_address: landmarkAddress || 'Davanagere Local Ward',
    ward_id: parseInt(wardId, 10) || 12,
    assigned_department_id: null,
    assigned_officer_id: null,
    upvotes_count: 1,
    in_pilot_bounds: inBounds,
    ai_advisory: aiTriage,
    potential_duplicates: potentialDuplicates,
    status_history: [
      {
        status: INCIDENT_STATUSES.UNVERIFIED,
        actor: req.user ? req.user.fullName : 'Citizen',
        remarks: 'Report submitted by citizen',
        timestamp: new Date(),
      },
    ],
    comments: [],
    created_at: new Date(),
    updated_at: new Date(),
    media,
  };

  memoryStore.incidents.unshift(newIncident);

  // Record audit log
  memoryStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'INCIDENT_CREATED',
    resource_type: 'INCIDENT',
    resource_id: newIncident.id,
    actor_id: newIncident.reporter_id,
    actor_name: newIncident.reporter_name,
    actor_role: req.user ? req.user.role : 'ANONYMOUS',
    remarks: `New incident ${formattedNum} reported in Ward ${newIncident.ward_id}`,
    created_at: new Date(),
  });

  // Socket.IO Broadcast to Davanagere Wards & Authority Command
  const io = req.app.get('io');
  if (io) {
    const publicPayload = sanitizeIncidentForViewer(newIncident, null, null);
    io.emit('incident:new', publicPayload);
    broadcastNearbyAlert({ incident: newIncident, io });
  }

  res.status(201).json({
    success: true,
    message: 'Civic incident reported successfully to Davanagere Portal.',
    data: sanitizeIncidentForViewer(newIncident, req.user ? req.user.role : null, req.user ? req.user.id : null),
  });
}

/**
 * 6. POST /api/incidents/:id/vouch
 */
function vouchIncident(req, res) {
  const { id } = req.params;
  const incident = memoryStore.incidents.find(i => i.id === id || i.incident_number === id);

  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }

  incident.upvotes_count = (incident.upvotes_count || 0) + 1;

  // Auto transition to COMMUNITY_CONFIRMED if ≥ 3 vouches
  let statusChanged = false;
  if (incident.status === INCIDENT_STATUSES.UNVERIFIED && incident.upvotes_count >= 3) {
    incident.status = INCIDENT_STATUSES.COMMUNITY_CONFIRMED;
    incident.updated_at = new Date();
    incident.status_history.push({
      status: INCIDENT_STATUSES.COMMUNITY_CONFIRMED,
      actor: 'Community Consensus',
      remarks: `Threshold reached (${incident.upvotes_count} community vouches in Ward ${incident.ward_id})`,
      timestamp: new Date(),
    });
    statusChanged = true;
  }

  const io = req.app.get('io');
  if (io) {
    io.emit('incident:vouched', {
      id: incident.id,
      upvotesCount: incident.upvotes_count,
      status: incident.status,
    });
    if (statusChanged) {
      io.emit('incident:status_changed', {
        id: incident.id,
        newStatus: incident.status,
        remarks: 'Community confirmed by resident vouches',
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Community vouch recorded.',
    upvotesCount: incident.upvotes_count,
    status: incident.status,
  });
}

/**
 * 7. POST /api/incidents/:id/comments
 */
function addComment(req, res) {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: 'Comment text is required.' });
  }

  const incident = memoryStore.incidents.find(i => i.id === id || i.incident_number === id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }

  if (!incident.comments) incident.comments = [];

  const newComment = {
    id: `com-${Date.now()}`,
    authorId: req.user ? req.user.id : 'anon',
    authorName: req.user ? req.user.fullName : 'Resident',
    authorRole: req.user ? req.user.role : 'CITIZEN',
    text: text.trim(),
    createdAt: new Date(),
  };

  incident.comments.push(newComment);

  const io = req.app.get('io');
  if (io) {
    io.emit(`incident:${incident.id}:comment`, newComment);
  }

  res.status(201).json({
    success: true,
    message: 'Community update posted.',
    data: newComment,
  });
}

module.exports = {
  getIncidents,
  getNearbyIncidents,
  getMyIncidents,
  getIncidentById,
  createIncident,
  vouchIncident,
  addComment,
};
