const mongoose = require('mongoose');

const BlockchainStatusSchema = new mongoose.Schema({
  blockNumber: Number,
  latestHash: String,
  latestTime: Date,
  txCount: Number,
  nodes: Number,
  confirmations: Number,
  explorer: String,
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('BlockchainStatus', BlockchainStatusSchema);
