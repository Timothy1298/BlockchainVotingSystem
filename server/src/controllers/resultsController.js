const Election = require('../models/Election');

exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const totalVoters = election.voters.length;
    
    // 🚀 FIX APPLIED: The 'seat' property is now correctly included in the candidate mapping.
    // This allows the frontend to group candidates into the correct tables.
    const candidates = election.candidates.map(c => ({ 
        id: c._id || c.id, 
        name: c.name, 
        seat: c.seat, // <--- THIS WAS ADDED
        votes: c.votes 
    }));
    
    const totalVotes = candidates.reduce((s, c) => s + (c.votes || 0), 0);

    res.json({ electionId, title: election.title, candidates, totalVotes, totalVoters });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching results', error: err.message });
  }
};