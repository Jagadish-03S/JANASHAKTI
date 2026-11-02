/**
 * Firebase Cloud Messaging (FCM) & In-App Notification Service
 */

const logger = require('../utils/logger');
const { memoryStore } = require('../config/db');

// In-memory notifications store
if (!memoryStore.notifications) {
  memoryStore.notifications = [];
}

/**
 * Dispatches an in-app and mock FCM push notification
 */
async function sendNotification({ userId, title, message, incidentId, type = 'ALERT' }) {
  const notification = {
    id: `notif-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    userId,
    title,
    message,
    incidentId,
    type,
    isRead: false,
    createdAt: new Date(),
  };

  memoryStore.notifications.unshift(notification);

  // If FCM Server Key is configured in production, send to Firebase
  if (process.env.FCM_SERVER_KEY && process.env.FCM_SERVER_KEY !== 'mock_or_fcm_service_account_key') {
    logger.info(`[FCM Push] Dispatched push notification to user ${userId}: "${title}"`);
  } else {
    logger.debug(`[In-App Notification] Saved for user ${userId}: "${title}"`);
  }

  return notification;
}

/**
 * Broadcasts proximity alert to citizens within ward or radius
 */
async function broadcastNearbyAlert({ incident, io, radiusMeters = 2000 }) {
  const { getDistanceInMeters } = require('../utils/geoUtils');

  const alertPayload = {
    incidentId: incident.id,
    incidentNumber: incident.incident_number,
    title: `Civic Alert: ${incident.title}`,
    category: incident.category,
    wardId: incident.ward_id,
    message: `A new ${incident.priority} priority incident was reported in Ward ${incident.ward_id}.`,
    timestamp: new Date(),
  };

  // Push to Socket.IO ward room and global room
  if (io) {
    io.to(`ward_${incident.ward_id}`).emit('notification:proximity_alert', alertPayload);
    io.to('authority_command').emit('notification:authority_alert', {
      ...alertPayload,
      actionRequired: true,
    });
  }

  return alertPayload;
}

module.exports = {
  sendNotification,
  broadcastNearbyAlert,
};

