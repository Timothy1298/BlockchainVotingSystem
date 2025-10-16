// Jest global setup: ensure test environment variables are set before any modules load
process.env.BLOCKCHAIN_MOCK = 'true';
process.env.SKIP_DB = 'true';
process.env.NODE_ENV = 'test';

// Optionally silence noisy logs from libraries
process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'error';

module.exports = async () => {};
