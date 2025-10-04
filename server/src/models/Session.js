const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ip: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  valid: { type: Boolean, default: true }
});

module.exports = mongoose.model('Session', sessionSchema);
