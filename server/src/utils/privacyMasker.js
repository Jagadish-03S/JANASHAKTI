/**
 * Privacy Masker Utility
 * Ensures reporter PII and domestic coordinates are not exposed publicly.
 */

const { ROLES } = require('../config/constants');
const { coarsenCoordinates } = require('./geoUtils');

/**
 * Strips reporter PII and masks exact location for public viewers.
 * Only verified AUTHORITY and ADMIN roles receive unmasked PII and exact GPS.
 */
function sanitizeIncidentForViewer(incident, viewerRole = null, viewerUserId = null) {
  if (!incident) return null;

  const isReporter = viewerUserId && incident.reporter_id === viewerUserId;
  const isAuthorityOrAdmin = viewerRole === ROLES.AUTHORITY || viewerRole === ROLES.ADMIN;

  const sanitized = { ...incident };

  // If not authority, admin, or the original reporter:
  if (!isAuthorityOrAdmin && !isReporter) {
    // Hide reporter PII
    delete sanitized.reporter_id;
    delete sanitized.reporter_name;
    delete sanitized.reporter_phone;
    delete sanitized.reporter_email;

    // Replace exact location with coarsened public location
    if (sanitized.exact_lat && sanitized.exact_lng) {
      const publicCoords = sanitized.public_lat && sanitized.public_lng
        ? { lat: sanitized.public_lat, lng: sanitized.public_lng }
        : coarsenCoordinates(sanitized.exact_lat, sanitized.exact_lng);

      sanitized.latitude = publicCoords.lat;
      sanitized.longitude = publicCoords.lng;
    }
    delete sanitized.exact_lat;
    delete sanitized.exact_lng;
  } else {
    // Authorized viewer: provide exact coordinates
    sanitized.latitude = sanitized.exact_lat || sanitized.latitude;
    sanitized.longitude = sanitized.exact_lng || sanitized.longitude;
  }

  return sanitized;
}

/**
 * Masks user profiles for public visibility
 */
function sanitizeUserProfile(user) {
  if (!user) return null;
  const { password_hash, ...safeUser } = user;
  safeUser.fullName = safeUser.full_name || safeUser.fullName;
  return safeUser;
}

module.exports = {
  sanitizeIncidentForViewer,
  sanitizeUserProfile,
};

