/**
 * JANASHAKTI AI Classification Service Bridge
 * 
 * CRITICAL COMPLIANCE POLICY:
 * Never label AI output as official verification.
 * All AI predictions are advisory triage suggestions requiring human authority review.
 */

const env = require('../config/env');
const logger = require('../utils/logger');
const { INCIDENT_CATEGORIES, INCIDENT_PRIORITIES } = require('../config/constants');

/**
 * Heuristic & ML fallback classifier for Davanagere civic incidents
 */
function heuristicClassify(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();

  let category = INCIDENT_CATEGORIES.OTHER;
  let priority = INCIDENT_PRIORITIES.MEDIUM;
  let suggestedDepartment = 'General Municipal Desk';
  let confidence = 0.70;

  if (/(pothole|crater|asphalt|tarmac|road|divider|pavement|cave-in|speed breaker)/i.test(text)) {
    category = INCIDENT_CATEGORIES.ROAD_HAZARD;
    suggestedDepartment = 'MCC Road & Civil Infrastructure';
    priority = text.includes('accident') || text.includes('deep') ? INCIDENT_PRIORITIES.HIGH : INCIDENT_PRIORITIES.MEDIUM;
    confidence = 0.94;
  } else if (/(leak|burst|pipeline|pipe|drinking water|tap|drainage|tanker|borewell)/i.test(text)) {
    category = INCIDENT_CATEGORIES.WATER_LEAKAGE;
    suggestedDepartment = 'MCC Water Supply & Drainage Division';
    priority = text.includes('flooding') ? INCIDENT_PRIORITIES.HIGH : INCIDENT_PRIORITIES.MEDIUM;
    confidence = 0.91;
  } else if (/(light|streetlight|dark|lamp|pole|wire|transformer|spark|power cut|bescom)/i.test(text)) {
    category = INCIDENT_CATEGORIES.STREETLIGHT;
    suggestedDepartment = 'BESCOM Davanagere Electricity Circle';
    priority = text.includes('spark') || text.includes('wire') ? INCIDENT_PRIORITIES.HIGH : INCIDENT_PRIORITIES.LOW;
    confidence = 0.95;
  } else if (/(garbage|waste|dump|trash|plastic|stench|litter|bins|cleaning)/i.test(text)) {
    category = INCIDENT_CATEGORIES.GARBAGE_DUMP;
    suggestedDepartment = 'MCC Solid Waste Management & Sanitation';
    priority = INCIDENT_PRIORITIES.MEDIUM;
    confidence = 0.89;
  } else if (/(accident|crash|collision|hit and run|traffic jam|vehicle)/i.test(text)) {
    category = INCIDENT_CATEGORIES.ACCIDENT;
    suggestedDepartment = 'Davanagere District Traffic Police';
    priority = INCIDENT_PRIORITIES.CRITICAL;
    confidence = 0.96;
  } else if (/(fire|smoke|flame|burn|cylinder|explosion)/i.test(text)) {
    category = INCIDENT_CATEGORIES.FIRE_SAFETY;
    suggestedDepartment = 'Karnataka Fire & Emergency Services Davanagere';
    priority = INCIDENT_PRIORITIES.CRITICAL;
    confidence = 0.98;
  } else if (/(sewage|drain|manhole|gutter|stench|overflow)/i.test(text)) {
    category = INCIDENT_CATEGORIES.SEWAGE_OVERFLOW;
    suggestedDepartment = 'MCC Water Supply & Drainage Division';
    priority = INCIDENT_PRIORITIES.HIGH;
    confidence = 0.92;
  }

  return {
    suggestedCategory: category,
    suggestedPriority: priority,
    suggestedDepartment,
    confidenceScore: confidence,
    isOfficialVerification: false, // MANDATORY: AI output is NEVER official verification
    disclaimer: 'AI classification is purely advisory. Official verification requires designated Authority inspection.',
  };
}

/**
 * Checks for potential duplicate incidents nearby
 */
function findPotentialDuplicates(title, lat, lng, existingIncidents = [], radiusMeters = 300) {
  const { getDistanceInMeters } = require('../utils/geoUtils');
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const duplicates = [];

  for (const inc of existingIncidents) {
    if (inc.status === 'RESOLVED' || inc.status === 'REJECTED') continue;
    const distance = getDistanceInMeters(lat, lng, inc.exact_lat || inc.latitude, inc.exact_lng || inc.longitude);

    if (distance <= radiusMeters) {
      const otherWords = inc.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      const overlap = titleWords.filter(w => otherWords.includes(w));

      if (overlap.length >= 1 || distance <= 100) {
        duplicates.push({
          incidentId: inc.id,
          incidentNumber: inc.incident_number,
          title: inc.title,
          distanceMeters: Math.round(distance),
          status: inc.status,
        });
      }
    }
  }

  return duplicates;
}

/**
 * Calls FastAPI AI service if running, else falls back to embedded intelligence
 */
async function classifyIncidentAI(title, description, lat, lng) {
  const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);

    const res = await fetch(`${aiServiceUrl}/api/v1/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        latitude: lat,
        longitude: lng,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      return {
        suggestedCategory: data.suggested_category,
        suggestedPriority: data.urgency_level,
        suggestedDepartment: data.suggested_department,
        confidenceScore: data.confidence_score,
        isOfficialVerification: false, // Enforced
        disclaimer: data.disclaimer,
      };
    }
  } catch (err) {
    logger.debug(`FastAPI microservice not reachable (${err.message}). Using local AI heuristic engine.`);
  }

  return heuristicClassify(title, description);
}

module.exports = {
  classifyIncidentAI,
  heuristicClassify,
  findPotentialDuplicates,
};

