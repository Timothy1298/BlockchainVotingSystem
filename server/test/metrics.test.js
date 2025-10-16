const metrics = require('../src/utils/metrics');

describe('metrics util', () => {
  beforeEach(() => metrics.reset());

  test('increments and formats text', () => {
    metrics.inc('events_processed_total');
    metrics.inc('events_failed_total', 2);
    const txt = metrics.metricsText();
    expect(txt).toContain('events_processed_total 1');
    expect(txt).toContain('events_failed_total 2');
  });
});
