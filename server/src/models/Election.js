const mongoose = require('mongoose');


const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seat: { type: String, required: true }, // Position/seat the candidate is vying for
  votes: { type: Number, default: 0 }
});

// Track voters as an array of voter identifiers (userId or wallet address)

const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  electionType: { type: String, required: true }, // e.g. 'Student Union', 'Faculty Rep', etc.
  seats: [{ type: String, required: true }], // List of positions/seats for this election
  // Optional on-chain mapping (numeric id used in deployed contract)
  chainId: { type: Number, required: false },
  description: String,
  startsAt: Date,
  endsAt: Date,
  candidates: [CandidateSchema],
  voters: [{ type: String }],
  status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'upcoming' },
  results: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', ElectionSchema);
