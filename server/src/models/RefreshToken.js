const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
