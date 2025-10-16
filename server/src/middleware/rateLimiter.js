let rateLimit;
try {
  rateLimit = require('express-rate-limit');
} catch (e) {
  if (process.env.NODE_ENV === 'test') {
    rateLimit = null;
  } else {
    throw e;
  }
}

const createLimiter = ({ windowMs = 60 * 1000, max = 10, message = 'Too many requests, please try again later.' } = {}) => {
  if (!rateLimit) {
    // only provide a no-op in test environment
    return (req, res, next) => next();
  }
  return rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false, message });
};

module.exports = { createLimiter };
