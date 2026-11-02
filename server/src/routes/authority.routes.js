const express = require('express');
const router = express.Router();
const {
  getAuthorityMetrics,
  updateIncidentStatus,
  assignDepartment,
  getAuditLogs,
} = require('../controllers/authority.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { requireRoles } = require('../middleware/rbac.middleware');
const { ROLES } = require('../config/constants');

// Guard all authority routes with strict RBAC
router.use(authenticateToken);
router.use(requireRoles(ROLES.AUTHORITY, ROLES.ADMIN));

router.get('/metrics', getAuthorityMetrics);
router.patch('/incidents/:id/status', updateIncidentStatus);
router.patch('/incidents/:id/assign', assignDepartment);
router.get('/audit-logs', requireRoles(ROLES.ADMIN), getAuditLogs);

module.exports = router;

