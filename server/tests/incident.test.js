const { describe, it } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');

describe('JANASHAKTI Incident & Spatial Lifecyle Test Suite (Phases 3-10)', () => {
  let citizenToken = '';
  let authorityToken = '';
  let createdIncidentId = '';

  it('Setup: Authenticate Citizen and Authority personas', async () => {
    // 1. Citizen login
    const citRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ramesh.cit@example.com', password: 'Password@123' });
    assert.strictEqual(citRes.status, 200);
    citizenToken = citRes.body.token;

    // 2. Authority login
    const authRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'officer@mcc.gov.in', password: 'Password@123' });
    assert.strictEqual(authRes.status, 200);
    authorityToken = authRes.body.token;
  });

  it('POST /api/incidents should create incident with AI advisory hints and SRID 4326 coords', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({
        title: 'Dangerous deep pothole near Bapuji Dental College',
        description: 'Large road crater on Hadadi Road causing severe vehicle instability and skidding.',
        category: 'ROAD_HAZARD',
        priority: 'HIGH',
        wardId: 12,
        latitude: 14.4678,
        longitude: 75.9234,
        landmarkAddress: 'Opposite Bapuji Dental College, Hadadi Road, Davanagere',
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.id);
    assert.strictEqual(res.body.data.status, 'UNVERIFIED');
    assert.ok(res.body.data.ai_advisory, 'AI advisory must be present');
    assert.strictEqual(res.body.data.ai_advisory.isOfficialVerification, false, 'AI must NEVER be official verification');

    createdIncidentId = res.body.data.id;
  });

  it('GET /api/incidents/nearby should return incidents within radius using spatial distance', async () => {
    const res = await request(app)
      .get('/api/incidents/nearby')
      .query({
        lat: 14.4644,
        lng: 75.9218,
        radius: 5000,
      });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.length > 0);
    assert.ok(res.body.data[0].distanceMeters !== undefined);
  });

  it('POST /api/incidents/:id/vouch should record vouch and transition to COMMUNITY_CONFIRMED at >=3', async () => {
    // Vouch 1
    const res1 = await request(app)
      .post(`/api/incidents/${createdIncidentId}/vouch`)
      .set('Authorization', `Bearer ${citizenToken}`);
    assert.strictEqual(res1.status, 200);

    // Vouch 2
    const res2 = await request(app)
      .post(`/api/incidents/${createdIncidentId}/vouch`)
      .set('Authorization', `Bearer ${citizenToken}`);
    assert.strictEqual(res2.status, 200);

    // Should now be COMMUNITY_CONFIRMED (started with 1 upvote on creation)
    assert.strictEqual(res2.body.status, 'COMMUNITY_CONFIRMED');
  });

  it('POST /api/incidents/:id/comments should post a community discussion note', async () => {
    const res = await request(app)
      .post(`/api/incidents/${createdIncidentId}/comments`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ text: 'I noticed this pothole this morning on my way to college, very dangerous!' });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.authorRole, 'CITIZEN');
  });

  it('PATCH /api/authority/incidents/:id/status should forbid CITIZEN and allow AUTHORITY', async () => {
    // 1. Citizen attempt (must be blocked 403)
    const blockedRes = await request(app)
      .patch(`/api/authority/incidents/${createdIncidentId}/status`)
      .set('Authorization', `Bearer ${citizenToken}`)
      .send({ status: 'OFFICIALLY_VERIFIED', remarks: 'Citizen attempting verification' });
    assert.strictEqual(blockedRes.status, 403);

    // 2. Official Authority commit (must succeed 200)
    const allowedRes = await request(app)
      .patch(`/api/authority/incidents/${createdIncidentId}/status`)
      .set('Authorization', `Bearer ${authorityToken}`)
      .send({
        status: 'OFFICIALLY_VERIFIED',
        remarks: 'MCC Ward Engineer verified depth is 15cm. Work order dispatched.',
      });
    assert.strictEqual(allowedRes.status, 200);
    assert.strictEqual(allowedRes.body.data.status, 'OFFICIALLY_VERIFIED');
  });

  it('GET /api/notifications should return notifications for authenticated user', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${citizenToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });
});

