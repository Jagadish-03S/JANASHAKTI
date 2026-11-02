const { memoryStore } = require('../config/db');
const { INCIDENT_STATUSES, ROLES } = require('../config/constants');
const { sanitizeIncidentForViewer } = require('../utils/privacyMasker');

function getAuthorityMetrics(req, res) {
  const incidents = memoryStore.incidents;

  const metrics = {
    totalReports: incidents.length,
    unverifiedCount: incidents.filter(i => i.status === INCIDENT_STATUSES.UNVERIFIED).length,
    communityConfirmedCount: incidents.filter(i => i.status === INCIDENT_STATUSES.COMMUNITY_CONFIRMED).length,
    underReviewCount: incidents.filter(i => i.status === INCIDENT_STATUSES.UNDER_AUTHORITY_REVIEW).length,
    officiallyVerifiedCount: incidents.filter(i => i.status === INCIDENT_STATUSES.OFFICIALLY_VERIFIED).length,
    inProgressCount: incidents.filter(i => i.status === INCIDENT_STATUSES.IN_PROGRESS).length,
    resolvedCount: incidents.filter(i => i.status === INCIDENT_STATUSES.RESOLVED).length,
    rejectedCount: incidents.filter(i => i.status === INCIDENT_STATUSES.REJECTED || i.status === INCIDENT_STATUSES.DUPLICATE).length,
    highPriorityCount: incidents.filter(i => i.priority === 'HIGH' || i.priority === 'CRITICAL').length,
    auditLogsCount: memoryStore.auditLogs.length,
  };

  res.status(200).json({
    success: true,
    data: metrics,
  });
}

function updateIncidentStatus(req, res) {
  const { id } = req.params;
  const { status, remarks, proofPhotoUrl } = req.body;

  if (!status || !Object.values(INCIDENT_STATUSES).includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status provided. Allowed: ${Object.values(INCIDENT_STATUSES).join(', ')}`,
    });
  }

  const incident = memoryStore.incidents.find(i => i.id === id || i.incident_number === id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }

  const prevStatus = incident.status;
  incident.status = status;
  incident.updated_at = new Date();

  if (proofPhotoUrl) {
    incident.resolution_proof_photo = proofPhotoUrl;
  }

  if (!incident.status_history) incident.status_history = [];
  incident.status_history.push({
    status,
    actor: req.user.fullName,
    actorRole: req.user.role,
    remarks: remarks || `Status officially updated to ${status}`,
    proofPhotoUrl: proofPhotoUrl || null,
    timestamp: new Date(),
  });

  // Record audit entry
  const auditEntry = {
    id: `aud-${Date.now()}`,
    action: 'STATUS_UPDATE',
    incident_id: incident.id,
    actor_id: req.user.id,
    actor_name: req.user.fullName,
    actor_role: req.user.role,
    previous_status: prevStatus,
    new_status: status,
    remarks: remarks || `Status updated via Authority Command Console to ${status}`,
    timestamp: new Date(),
  };
  memoryStore.auditLogs.unshift(auditEntry);

  // Broadcast real-time update
  const io = req.app.get('io');
  if (io) {
    io.emit('incident:status_changed', {
      id: incident.id,
      incidentNumber: incident.incident_number,
      previousStatus: prevStatus,
      newStatus: status,
      updatedBy: req.user.fullName,
      remarks,
    });
  }

  res.status(200).json({
    success: true,
    message: `Incident ${incident.incident_number} status updated to ${status}`,
    data: sanitizeIncidentForViewer(incident, req.user.role, req.user.id),
  });
}

function assignDepartment(req, res) {
  const { id } = req.params;
  const { departmentId, officerId, officerName } = req.body;

  const incident = memoryStore.incidents.find(i => i.id === id || i.incident_number === id);
  if (!incident) {
    return res.status(404).json({ success: false, message: 'Incident not found.' });
  }

  incident.assigned_department_id = departmentId || incident.assigned_department_id;
  incident.assigned_officer_id = officerId || incident.assigned_officer_id;
  incident.assigned_officer_name = officerName || incident.assigned_officer_name;
  incident.updated_at = new Date();

  // Audit log
  memoryStore.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    action: 'DISPATCH_ASSIGNMENT',
    incident_id: incident.id,
    actor_id: req.user.id,
    actor_name: req.user.fullName,
    actor_role: req.user.role,
    remarks: `Incident dispatched to department ${departmentId}`,
    timestamp: new Date(),
  });

  res.status(200).json({
    success: true,
    message: 'Department assignment updated.',
    data: incident,
  });
}

function getAuditLogs(req, res) {
  const { action, limit = 50 } = req.query;
  let logs = [...memoryStore.auditLogs];

  if (action) {
    logs = logs.filter(l => l.action === action);
  }

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs.slice(0, parseInt(limit, 10)),
  });
}

module.exports = {
  getAuthorityMetrics,
  updateIncidentStatus,
  assignDepartment,
  getAuditLogs,
};
