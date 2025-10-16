const mongoose = require('mongoose');

const ProcessedEventSchema = new mongoose.Schema({
  txHash: { type: String, required: true, index: true },
  logIndex: { type: Number, required: true },
  processedAt: { type: Date, default: Date.now },
  meta: { type: Object }
});

ProcessedEventSchema.index({ txHash: 1, logIndex: 1 }, { unique: true });

module.exports = mongoose.model('ProcessedEvent', ProcessedEventSchema);
