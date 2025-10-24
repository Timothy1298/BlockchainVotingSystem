const mongoose = require('mongoose');

const BlockchainStatusSchema = new mongoose.Schema({
  nodeUrl: { type: String, required: true },
  isHealthy: { type: Boolean, default: true },
  lastChecked: { type: Date, default: Date.now },
  blockNumber: { type: Number },
  networkId: { type: Number },
  gasPrice: { type: String },
  peerCount: { type: Number },
  syncStatus: { type: String },
  responseTime: { type: Number }, // in milliseconds
  errorMessage: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BlockchainStatus', BlockchainStatusSchema);