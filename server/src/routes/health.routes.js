const express = require('express');
const router = express.Router();
const { getHealth, getPilotInfo } = require('../controllers/health.controller');

router.get('/health', getHealth);
router.get('/pilot', getPilotInfo);

module.exports = router;

