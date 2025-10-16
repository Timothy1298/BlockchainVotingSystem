let logger;
const config = require('../config');
try {
  const { createLogger, format, transports } = require('winston');
  logger = createLogger({
    level: config.logLevel || 'info',
    format: format.combine(
      format.timestamp(),
      format.errors({ stack: true }),
      format.splat(),
      format.json()
    ),
    defaultMeta: { service: 'voting-backend' },
    transports: [new transports.Console()]
  });
} catch (e) {
  // Fallback only in test environment
  if (process.env.NODE_ENV === 'test') {
    const levels = ['error', 'warn', 'info', 'debug'];
    logger = {};
    for (const lvl of levels) {
      logger[lvl] = (...args) => {
        // preserve basic formatting
        // eslint-disable-next-line no-console
        console.log(new Date().toISOString(), lvl.toUpperCase(), ...args);
      };
    }
    logger.child = () => logger;
  } else {
    // Re-throw to surface missing dependency in non-test environments
    throw e;
  }
}

module.exports = logger;
