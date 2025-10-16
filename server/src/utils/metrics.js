const counters = {};

function inc(name, value = 1) {
  counters[name] = (counters[name] || 0) + value;
}

function get(name) {
  return counters[name] || 0;
}

function reset() {
  for (const k of Object.keys(counters)) delete counters[k];
}

function metricsText() {
  // Prometheus exposition style minimal
  let out = '';
  for (const k of Object.keys(counters)) {
    out += `# TYPE ${k} counter\n`;
    out += `${k} ${counters[k]}\n`;
  }
  return out;
}

module.exports = { inc, get, reset, metricsText };
