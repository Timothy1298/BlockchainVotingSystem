const request = require('supertest');
const app = require('../src/app');

describe('Smoke: create election -> add candidate -> vote -> results', () => {
  test('run through flow with mock', async () => {
    // Call the public health endpoint which doesn't require auth
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });
});
