const Election = require('../models/Election');
const CandidateDocument = require('../models/CandidateDocument');

module.exports = {
  async addCandidate(req, res) {
    const { electionId } = req.params;
    const { name, seat, party, manifesto, photo } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    const candidate = { name, seat, party, manifesto, photo, votes: 0 };
    election.candidates.push(candidate);
    await election.save();
    res.json(election.candidates[election.candidates.length - 1]);
  },

  async editCandidate(req, res) {
    const { electionId, candidateId } = req.params;
    const { name, seat, party, manifesto, photo } = req.body;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    const candidate = election.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    if (name) candidate.name = name;
    if (seat) candidate.seat = seat;
    if (party) candidate.party = party;
    if (manifesto) candidate.manifesto = manifesto;
    if (photo) candidate.photo = photo;
    await election.save();
    res.json(candidate);
  },

  async removeCandidate(req, res) {
    const { electionId, candidateId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ error: 'Election not found' });
    const candidate = election.candidates.id(candidateId);
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    candidate.remove();
    await election.save();
    res.json({ success: true });
  },

  async uploadDocument(req, res) {
    // Assume file upload middleware sets req.file.url
    const { electionId, candidateId } = req.params;
    const { type } = req.body;
    const url = req.file?.url || req.body.url;
    if (!url) return res.status(400).json({ error: 'No document URL provided' });
    const doc = new CandidateDocument({ candidateId, electionId, url, type });
    await doc.save();
    res.json(doc);
  },

  async listDocuments(req, res) {
    const { candidateId } = req.params;
    const docs = await CandidateDocument.find({ candidateId });
    res.json(docs);
  }
};
