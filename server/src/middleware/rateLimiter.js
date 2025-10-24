const rateLimit = require('express-rate-limit');

function createLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs: windowMs || 60 * 1000,
    max: max || 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: message || 'Too many requests, please try again later.'
  });
}

// Presets
const loginLimiter = createLimiter({ windowMs: 5 * 60 * 1000, max: 10, message: 'Too many login attempts, wait a few minutes.' });
const registerLimiter = createLimiter({ windowMs: 60 * 60 * 1000, max: 5, message: 'Too many registrations from this source. Try later.' });
const voteLimiter = createLimiter({ windowMs: 60 * 1000, max: 3, message: 'Too many votes from this source, slow down.' });

module.exports = { createLimiter, loginLimiter, registerLimiter, voteLimiter };
