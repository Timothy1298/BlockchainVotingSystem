const Election = require('../models/Election');

exports.list = async (req, res) => {
  try {
    // If DB connection is skipped in dev, return an empty list instead of attempting a DB query
    if (process.env.SKIP_DB === 'true') {
      console.warn('SKIP_DB is true - returning empty elections list (dev mode)');
      return res.json([]);
    }
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching elections', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, description, startsAt, endsAt } = req.body;
    const election = new Election({ title, description, startsAt, endsAt, createdBy: req.user.id });
    await election.save();
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error creating election', error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching election', error: err.message });
  }
};

exports.addCandidate = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Candidate name required' });
    election.candidates.push({ name });
    await election.save();
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error adding candidate', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    const { title, description, startsAt, endsAt } = req.body;
    if (title) election.title = title;
    if (description) election.description = description;
    if (startsAt) election.startsAt = startsAt;
    if (endsAt) election.endsAt = endsAt;
    await election.save();
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: 'Error updating election', error: err.message });
  }
};

exports.getCandidatesByElection = async (req, res) => {
  try {
    // When DB is skipped (dev), return an empty candidate set to avoid 500s
    if (process.env.SKIP_DB === 'true') {
      console.warn('SKIP_DB is true - returning empty candidates list (dev mode)');
      return res.json([]);
    }
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election.candidates.map(c => ({ id: c._id || c.id, name: c.name, votes: c.votes })));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching candidates', error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json({ message: 'Election deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting election', error: err.message });
  }
};
