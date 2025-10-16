const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../utils/logger');

function mandatory(req, res, next) {
  const rawAuth = req.header('Authorization');
  // Log incoming Authorization header for diagnostics
  if (rawAuth) {
    logger.debug('Incoming Authorization header: %s', rawAuth.length > 40 ? `${rawAuth.slice(0,20)}...${rawAuth.slice(-10)}` : rawAuth);
  } else {
    logger.debug('No Authorization header present on request');
  }
  const token = rawAuth?.replace('Bearer ', '') || req.query.token || req.body.token;
  if (!token) return res.error ? res.error(401, 'No token, authorization denied', 5001) : res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid token: %s', err?.message || err);
    // Add diagnostic info for common jwt errors
    if (err && err.name) logger.debug('JWT error name: %s', err.name);
    if (err && err.stack) logger.debug('JWT error stack: %s', err.stack.split('\n').slice(0,3).join(' | '));
    return res.error ? res.error(401, 'Token is not valid', 5002) : res.status(401).json({ message: 'Token is not valid' });
  }
}

function optional(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token || req.body.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
  } catch (err) {
    logger.debug('Optional token invalid: %s', err?.message || err);
  }
  next();
}

module.exports = { mandatory, optional };
