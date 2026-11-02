const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  registerDeviceToken,
} = require('../controllers/notification.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

router.use(authenticateToken);
router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.post('/device-token', registerDeviceToken);

module.exports = router;

