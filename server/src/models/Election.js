const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  votes: { type: Number, default: 0 }
});

// Track voters as an array of voter identifiers (userId or wallet address)
const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  // Optional on-chain mapping (numeric id used in deployed contract)
  chainId: { type: Number, required: false },
  description: String,
  startsAt: Date,
  endsAt: Date,
  candidates: [CandidateSchema],
  voters: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', ElectionSchema);
