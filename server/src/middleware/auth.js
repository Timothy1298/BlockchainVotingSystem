const jwt = require('jsonwebtoken');

function mandatory(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token || req.body.token;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}

function optional(req, res, next) {
  const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token || req.body.token;
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
  } catch (err) {
    // ignore invalid token in optional mode
  }
  next();
}

// ✅ Correct export:
module.exports = { mandatory, optional };
