const request = require('supertest');
const app = require('../src/app');
const jwt = require('jsonwebtoken');
const config = require('../src/config');

describe('GET /api/blockchain/elections/:id/preview', () => {
  it('returns mock preview when SKIP_DB=true', async () => {
    process.env.SKIP_DB = 'true';
    // create admin token
    const token = jwt.sign({ id: 'test-admin', role: 'admin' }, config.jwtSecret || 'dev-secret');
    const res = await request(app)
      .get('/api/blockchain/elections/123/preview')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', '123');
    expect(res.body).toHaveProperty('seats');
    expect(Array.isArray(res.body.seats)).toBe(true);
  });
});
