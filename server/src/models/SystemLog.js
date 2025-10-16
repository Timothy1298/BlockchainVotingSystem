const mongoose = require('mongoose');

const SystemLogSchema = new mongoose.Schema({
  component: { type: String, required: false },
  action: { type: String, required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  level: { type: String, enum: ['info', 'warn', 'error', 'debug'], default: 'info' },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SystemLog', SystemLogSchema);
