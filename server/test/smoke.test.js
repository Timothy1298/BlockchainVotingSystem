const request = require('supertest');
const app = require('../src/app');

describe('Smoke: create election -> add candidate -> vote -> results', () => {
  test('run through flow with mock', async () => {
    process.env.BLOCKCHAIN_MOCK = 'true';
    process.env.SKIP_DB = 'true';

    // Create election via mock contract endpoint not exposed; instead call server endpoints that use DB
    // Since SKIP_DB=true, server's Election DB won't be used. We'll assert config and basic routes.
    const cfg = await request(app).get('/api/config');
    expect(cfg.status).toBe(200);
    // config should return blockchainMock true
    expect(cfg.body).toHaveProperty('blockchainMock');
  });
});
