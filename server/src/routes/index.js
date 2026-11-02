const express = require('express');
const router = express.Router();

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const incidentRoutes = require('./incident.routes');
const authorityRoutes = require('./authority.routes');
const notificationRoutes = require('./notification.routes');

router.use('/', healthRoutes);
router.use('/auth', authRoutes);
router.use('/incidents', incidentRoutes);
router.use('/authority', authorityRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
