// Normalized response helper middleware

module.exports = (req, res, next) => {
  // Attach helpers
  res.success = (data, message = 'OK', code = 0) => res.json({ success: true, data, message, errorCode: code });
  res.error = (status, message = 'Error', code = 1, data = null) => res.status(status).json({ success: false, data, message, errorCode: code });
  next();
};
