const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

describe('JANASHAKTI API Phase 1 Test Suite', () => {
  it('GET /api/health should return 200 with OPERATIONAL status and Davanagere metadata', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.status, 'OPERATIONAL');
    assert.strictEqual(res.body.pilotDeployment.city, 'Davanagere');
    assert.strictEqual(res.body.pilotDeployment.totalWards, 45);
    assert.ok(Array.isArray(res.body.activeModules));
  });

  it('GET /api/pilot should return complete Davanagere boundaries and departments', async () => {
    const res = await request(app).get('/api/pilot');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.data.CITY_NAME, 'Davanagere');
    assert.strictEqual(res.body.data.STATE, 'Karnataka');
    assert.strictEqual(res.body.data.CENTER_COORDINATES.lat, 14.4644);
    assert.strictEqual(res.body.data.CENTER_COORDINATES.lng, 75.9218);
    assert.ok(res.body.data.DEPARTMENTS.length >= 5);
  });

  it('GET /api/incidents should return public feed with masked reporter PII and coordinates', async () => {
    const res = await request(app).get('/api/incidents');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);

    // Verify privacy masking: public viewer must NOT see reporter phone, email, or exact coordinates
    const first = res.body.data[0];
    assert.strictEqual(first.reporter_phone, undefined, 'Reporter phone must be masked');
    assert.strictEqual(first.reporter_email, undefined, 'Reporter email must be masked');
    assert.strictEqual(first.exact_lat, undefined, 'Exact latitude must be masked');
    assert.ok(first.latitude !== undefined, 'Public blurred latitude must be present');
  });

  it('GET /api/auth/demo-accounts should return 4 test roles (Citizen, Volunteer, Authority, Admin)', async () => {
    const res = await request(app).get('/api/auth/demo-accounts');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.demoAccounts.length, 4);

    const roles = res.body.demoAccounts.map(a => a.role);
    assert.ok(roles.includes('CITIZEN'));
    assert.ok(roles.includes('VOLUNTEER'));
    assert.ok(roles.includes('AUTHORITY'));
    assert.ok(roles.includes('ADMIN'));
  });

  it('POST /api/auth/login should authenticate citizen and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ramesh.cit@example.com',
        password: 'Password@123',
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'CITIZEN');
  });

  it('POST /api/auth/login with invalid credentials should return 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'ramesh.cit@example.com',
        password: 'WrongPassword',
      });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });
});

