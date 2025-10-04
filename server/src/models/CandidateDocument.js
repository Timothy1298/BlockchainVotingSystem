const mongoose = require('mongoose');

const CandidateDocumentSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  url: { type: String, required: true },
  type: { type: String },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CandidateDocument', CandidateDocumentSchema);
