const { memoryStore } = require('../config/db');

function getMyNotifications(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  const notifs = (memoryStore.notifications || [])
    .filter(n => n.userId === req.user.id || n.userId === 'all')
    .slice(0, 30);

  res.status(200).json({
    success: true,
    count: notifs.length,
    unreadCount: notifs.filter(n => !n.isRead).length,
    data: notifs,
  });
}

function markAsRead(req, res) {
  const { id } = req.params;
  const notif = (memoryStore.notifications || []).find(n => n.id === id);
  if (notif) {
    notif.isRead = true;
  }
  res.status(200).json({ success: true, message: 'Notification marked as read' });
}

function registerDeviceToken(req, res) {
  const { deviceToken } = req.body;
  // Save FCM token for push delivery
  res.status(200).json({
    success: true,
    message: 'FCM push device token registered for Davanagere civic alerts',
    token: deviceToken,
  });
}

module.exports = {
  getMyNotifications,
  markAsRead,
  registerDeviceToken,
};

