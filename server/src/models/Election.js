const mongoose = require('mongoose');

const CandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  seat: { type: String, required: true }, // Position/seat the candidate is vying for
  votes: { type: Number, default: 0 },
  chainCandidateId: { type: Number },
  bio: { type: String },
  photoUrl: { type: String },
  manifesto: { type: String },
  nameHash: { type: String }, // Hash of candidate name for verification
  isActive: { type: Boolean, default: true },
  party: { type: String },
  position: { type: String },
  email: { type: String },
  phone: { type: String },
  age: { type: Number }
});

const ElectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  electionType: { type: String, required: true }, // e.g. 'Student Union', 'Faculty Rep', etc.
  seats: [{ type: String, required: true }], // List of positions/seats for this election
  subSeats: { type: mongoose.Schema.Types.Mixed, default: {} }, // Sub-seats for positions like Faculty Representative
  // Optional on-chain mapping (numeric id used in deployed contract)
  chainElectionId: { type: Number, required: false },
  lastSyncedBlock: { type: Number, required: false },
  statusHistory: [{ 
    status: { type: String, enum: ['Setup', 'Open', 'Closed', 'Finalized'] }, 
    at: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  turnoutPercentage: { type: Number, required: false },
  description: String,
  startsAt: Date,
  endsAt: Date,
  candidates: [CandidateSchema],
  voters: [{ type: String }], // Array of voter addresses/IDs
  registeredVoters: [{ type: String }], // Array of registered voter addresses
  voterSeatVotes: { type: mongoose.Schema.Types.Mixed, default: {} }, // Track which seats each voter has voted for
  voterCandidateVotes: { type: mongoose.Schema.Types.Mixed, default: {} }, // Track which specific candidates each voter has voted for
  status: { 
    type: String, 
    enum: ['Setup', 'Open', 'Closed', 'Finalized'], 
    default: 'Setup' 
  },
  votingEnabled: { type: Boolean, default: false },
  candidateListLocked: { type: Boolean, default: false },
  results: { type: mongoose.Schema.Types.Mixed, default: {} },
  finalResultsHash: { type: String }, // Hash of final results for verification
  totalVotes: { type: Number, default: 0 },
  rules: {
    oneVotePerId: { type: Boolean, default: true },
    anonymous: { type: Boolean, default: true },
    eligibility: { type: String, default: 'registered' }
  },
  phases: [{
    name: String,
    start: Date,
    end: Date
  }],
  ballotStructure: { 
    type: String, 
    enum: ['single', 'multiple', 'ranked'], 
    default: 'single' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Election', ElectionSchema);
