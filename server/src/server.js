const config = require('./config');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
const { uploadsDir } = require('./middleware/upload');
const { startTallySyncJob } = require('./jobs/tallySync');
const express = require('express');
// Security headers
app.use(helmet());

// Strict CORS (adjust origin as needed)
app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? [process.env.CLIENT_ORIGIN] : [/^http:\/\/localhost:\d+$/],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
  credentials: true
}));

// Serve uploads statically (read-only)
app.use('/uploads', express.static(uploadsDir));

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

  // Start tally sync job
  startTallySyncJob();
})();