const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

describe('JANASHAKTI Phase 2 Authentication Test Suite', () => {
  const testCitizen = {
    fullName: 'Ananya Rao',
    email: `ananya.rao.${Date.now()}@example.com`,
    phoneNumber: '+919876543210',
    password: 'SecurePassword123',
    role: 'CITIZEN',
  };

  it('POST /api/auth/register should successfully register a new Citizen and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testCitizen);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token, 'Token must be returned');
    assert.strictEqual(res.body.user.role, 'CITIZEN');
    assert.strictEqual(res.body.user.email, testCitizen.email.toLowerCase());
    assert.strictEqual(res.body.user.password_hash, undefined, 'Password hash must be redacted');
  });

  it('POST /api/auth/register with duplicate email should return 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testCitizen);

    assert.strictEqual(res.status, 409);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('already registered'));
  });

  it('POST /api/auth/register should fail with invalid email format', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Invalid User',
        email: 'invalid-email-format',
        password: 'ValidPassword123',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('valid email'));
  });

  it('POST /api/auth/register should fail with short password (< 6 chars)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Short Pass User',
        email: 'shortpass@example.com',
        password: '123',
      });

    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.ok(res.body.message.includes('at least 6 characters'));
  });

  it('POST /api/auth/register with ADMIN role request should fallback safely to CITIZEN', async () => {
    const maliciousAdminAttempt = {
      fullName: 'Fake Admin Candidate',
      email: `fake.admin.${Date.now()}@example.com`,
      password: 'AdminPassword123',
      role: 'ADMIN', // User attempts to escalate privilege
    };

    const res = await request(app)
      .post('/api/auth/register')
      .send(maliciousAdminAttempt);

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.user.role, 'CITIZEN', 'Public registration must never allow self-granting ADMIN role');
  });

  it('POST /api/auth/login should authenticate registered citizen and return JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testCitizen.email,
        password: testCitizen.password,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.email, testCitizen.email.toLowerCase());
  });

  it('GET /api/auth/me should return current user profile when authenticated with Bearer token', async () => {
    // First login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testCitizen.email,
        password: testCitizen.password,
      });

    const token = loginRes.body.token;

    // Call /me
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meRes.body.success, true);
    assert.strictEqual(meRes.body.user.email, testCitizen.email.toLowerCase());
    assert.strictEqual(meRes.body.user.role, 'CITIZEN');
  });

  it('GET /api/auth/me without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.body.success, false);
  });

  it('POST /api/auth/forgot-password should return 200 with OTP hint in pilot mode', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testCitizen.email });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.pilotHint);
  });

  it('POST /api/auth/reset-password with valid OTP 123456 should reset password', async () => {
    const newPassword = 'NewSecretPassword999';
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({
        email: testCitizen.email,
        otp: '123456',
        newPassword,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);

    // Verify login with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testCitizen.email,
        password: newPassword,
      });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
  });
});

