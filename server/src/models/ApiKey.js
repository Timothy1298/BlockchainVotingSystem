const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key: { type: String, required: true, unique: true },
  label: { type: String },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date },
  revoked: { type: Boolean, default: false }
});

module.exports = mongoose.model('ApiKey', apiKeySchema);
