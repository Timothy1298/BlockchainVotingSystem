const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const userId = req.user?.id || null;
    logger.info('%s %s %d %dms user=%s', req.method, req.originalUrl, res.statusCode, duration, userId);
  });
  next();
};
