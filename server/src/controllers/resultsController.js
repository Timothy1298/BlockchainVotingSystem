const Election = require('../models/Election');

exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const totalVoters = election.voters.length;
    const candidates = election.candidates.map(c => ({ id: c._id || c.id, name: c.name, votes: c.votes }));
    const totalVotes = candidates.reduce((s, c) => s + (c.votes || 0), 0);

    // turnout percentage is (totalVotes / registeredVoters) — we don't have registered count here.
    // For now, report voters count and votes count; front-end can compute % if registered count provided.
    res.json({ electionId, title: election.title, candidates, totalVotes, totalVoters });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching results', error: err.message });
  }
};
