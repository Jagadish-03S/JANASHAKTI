const API_BASE = '/api';

function getHeaders(isFormData = false) {
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('janashakti_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // System Health & Pilot Telemetry
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  async getPilotInfo() {
    const res = await fetch(`${API_BASE}/pilot`);
    return res.json();
  },

  // Auth Operations
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(email, otp, newPassword) {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, newPassword }),
    });
    return res.json();
  },

  async getDemoAccounts() {
    const res = await fetch(`${API_BASE}/auth/demo-accounts`);
    return res.json();
  },

  // Incidents Public & Protected
  async getIncidents(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/incidents?${query}` : `${API_BASE}/incidents`;
    const res = await fetch(url, { headers: getHeaders() });
    return res.json();
  },

  async getIncidentById(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async createIncident(formData) {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return res.json();
  },

  async vouchIncident(id) {
    const res = await fetch(`${API_BASE}/incidents/${id}/vouch`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return res.json();
  },

  // Authority Operations
  async getAuthorityMetrics() {
    const res = await fetch(`${API_BASE}/authority/metrics`, { headers: getHeaders() });
    return res.json();
  },

  async updateIncidentStatus(id, status, remarks) {
    const res = await fetch(`${API_BASE}/authority/incidents/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, remarks }),
    });
    return res.json();
  },

  async getAuditLogs() {
    const res = await fetch(`${API_BASE}/authority/audit-logs`, { headers: getHeaders() });
    return res.json();
  },
};
