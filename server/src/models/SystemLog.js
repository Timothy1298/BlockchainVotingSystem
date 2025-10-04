const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  details: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SystemLog', SystemLogSchema);
