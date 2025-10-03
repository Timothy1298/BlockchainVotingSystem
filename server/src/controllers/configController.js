exports.getConfig = async (req, res) => {
  try {
    const config = {
      votingContractAddress: process.env.VOTING_CONTRACT_ADDRESS || null,
      blockchainMock: process.env.BLOCKCHAIN_MOCK === 'true' || false,
    };
    res.json(config);
  } catch (err) {
    res.status(500).json({ message: 'Error reading config', error: err.message });
  }
};

// Accept a client-submitted transaction receipt to sync DB state for client-signed on-chain votes.
// Body: { txHash, electionId, candidateId, voterId }
const Election = require('../models/Election');
exports.postTxReceipt = async (req, res) => {
  try {
    const { txHash, electionId, candidateId, voterId } = req.body;
    if (!txHash || !electionId || !candidateId) return res.status(400).json({ message: 'txHash, electionId and candidateId are required' });

    // Only attempt DB sync when DB is available
    if (process.env.SKIP_DB === 'true') return res.status(200).json({ message: 'SKIP_DB=true — no DB sync performed' });

    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const voterIdentifier = voterId || req.user?.id || (req.body.voterAddress) || (req.headers['x-forwarded-for'] || req.ip || '').toString();
    if (election.voters.includes(String(voterIdentifier))) return res.status(400).json({ message: 'Voter already recorded' });

    // Find candidate and increment
    const candidate = election.candidates.id ? election.candidates.id(candidateId) : election.candidates.find(c => String(c._id) === String(candidateId) || String(c.id) === String(candidateId));
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });
    candidate.votes = (candidate.votes || 0) + 1;
    election.voters.push(String(voterIdentifier));
    await election.save();

    res.json({ message: 'DB synced', txHash });
  } catch (err) {
    res.status(500).json({ message: 'Error processing tx receipt', error: err.message });
  }
};
