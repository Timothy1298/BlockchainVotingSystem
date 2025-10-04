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
    const { title, description, startsAt, endsAt, electionType, seats } = req.body;
    if (!electionType) return res.status(400).json({ message: 'electionType is required' });
    if (!Array.isArray(seats) || seats.length === 0) return res.status(400).json({ message: 'At least one seat/position is required' });
    const election = new Election({ title, description, startsAt, endsAt, electionType, seats, createdBy: req.user.id });
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
    const { name, seat } = req.body;
    if (!name) return res.status(400).json({ message: 'Candidate name required' });
    if (!seat || !election.seats.includes(seat)) return res.status(400).json({ message: 'Valid seat/position required' });
    election.candidates.push({ name, seat });
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
    res.json(election.candidates.map(c => ({ id: c._id || c.id, name: c.name, seat: c.seat, votes: c.votes })));
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
exports.overview = async (req, res) => {
  try {
    // Skip DB for dev mode
    if (process.env.SKIP_DB === 'true') {
      console.warn('SKIP_DB is true - returning empty overview (dev mode)');
      return res.json({
        totalElections: 0,
        totalCandidates: 0,
        ongoingElections: 0,
        upcomingElections: 0,
        pastElections: 0,
      });
    }

    const elections = await Election.find();

    const now = new Date();
    const totalCandidates = elections.reduce((acc, el) => acc + (el.candidates?.length || 0), 0);
    const ongoingElections = elections.filter(el => el.startsAt <= now && el.endsAt >= now).length;
    const upcomingElections = elections.filter(el => el.startsAt > now).length;
    const pastElections = elections.filter(el => el.endsAt < now).length;

    res.json({
      totalElections: elections.length,
      totalCandidates,
      ongoingElections,
      upcomingElections,
      pastElections,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching overview', error: err.message });
  }
};