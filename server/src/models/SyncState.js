const mongoose = require('mongoose');

const SyncStateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  lastProcessedBlock: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SyncState', SyncStateSchema);
