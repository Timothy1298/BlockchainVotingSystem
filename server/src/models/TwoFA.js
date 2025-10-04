const mongoose = require('mongoose');

const twoFASchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  secret: { type: String, required: true },
  enabled: { type: Boolean, default: false },
  backupCodes: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TwoFA', twoFASchema);
