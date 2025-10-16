const config = require('./config');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const PORT = config.port || 5000;

(async () => {
  const connected = await connectDB(config.mongoUri);
  if (!connected) {
    logger.warn('Continuing to start server without MongoDB connection (dev mode)');
  }

  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

  // Start blockchain listener (best-effort)
  try {
    const listener = require('./blockchain/listener');
    listener.init().catch(e => logger.warn('Blockchain listener init error: %s', e?.message || e));
  } catch (err) {
    logger.warn('Blockchain listener module not available: %s', err?.message || err);
  }
})();