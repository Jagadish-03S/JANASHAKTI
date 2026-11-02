/**
 * Geolocation & Spatial Utility Functions
 * Pilot City: Davanagere, Karnataka
 */

const { DAVANAGERE_METADATA } = require('../config/constants');

/**
 * Calculates Haversine distance in meters between two coordinates
 */
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Checks if coordinates fall within Davanagere bounding box
 */
function isWithinDavanagereBounds(lat, lng) {
  const { minLat, maxLat, minLng, maxLng } = DAVANAGERE_METADATA.BOUNDS;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

/**
 * Coarsens coordinates for public privacy protection.
 * Blurs exact GPS by ~100 meters to protect domestic privacy.
 */
function coarsenCoordinates(lat, lng, jitterRadiusMeters = 100) {
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return { lat, lng };
  }

  // 1 degree latitude is approx 111,320 meters
  const deltaLat = (jitterRadiusMeters / 111320) * (Math.random() - 0.5);
  // 1 degree longitude at Davanagere (lat ~14.46) is approx 111,320 * cos(14.46°) = ~107,700 meters
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const deltaLng = (jitterRadiusMeters / (111320 * cosLat)) * (Math.random() - 0.5);

  return {
    lat: Number((lat + deltaLat).toFixed(5)),
    lng: Number((lng + deltaLng).toFixed(5)),
  };
}

module.exports = {
  getDistanceInMeters,
  isWithinDavanagereBounds,
  coarsenCoordinates,
};

