const mongoose = require('mongoose');

const BallotSchema = new mongoose.Schema({
  election: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  structure: { type: String, enum: ['single', 'multiple', 'ranked'], default: 'single' },
  rules: {
    oneVotePerId: { type: Boolean, default: true },
    anonymous: { type: Boolean, default: true },
    eligibility: { type: String },
  },
  phases: [{
    name: { type: String },
    start: { type: Date },
    end: { type: Date }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ballot', BallotSchema);
