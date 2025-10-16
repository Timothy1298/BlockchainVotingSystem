const { exec } = require('child_process');

exports.getConfig = async (req, res) => {
  // Return blockchain config (mocked for now)
  res.json({ blockSize: 1, miningDifficulty: 2, consensus: 'PoA', encryption: 'AES256' });
};

exports.updateConfig = async (req, res) => {
  // Update blockchain config (mocked)
  res.json({ success: true });
};

exports.listNodes = async (req, res) => {
  // Return list of nodes (mocked)
  res.json([{ id: 'node1', status: 'active' }, { id: 'node2', status: 'active' }]);
};

exports.addNode = async (req, res) => {
  // Add node (mocked)
  res.json({ success: true });
};

exports.removeNode = async (req, res) => {
  // Remove node (mocked)
  res.json({ success: true });
};

exports.txPool = async (req, res) => {
  // Return pending transactions (mocked)
  res.json([{ tx: '0xabc', status: 'pending' }]);
};

exports.setEncryption = async (req, res) => {
  // Enable/disable encryption (mocked)
  res.json({ success: true });
};

exports.fraudAlerts = async (req, res) => {
  // Return fraud alerts (mocked)
  res.json([{ id: 1, type: 'double-vote', resolved: false }]);
};

exports.backup = async (req, res) => {
  // Data backup (mocked)
  res.json({ success: true });
};

exports.restore = async (req, res) => {
  // Data restore (mocked)
  res.json({ success: true });
};
const BlockchainStatus = require('../models/BlockchainStatus');

exports.getStatus = async (req, res) => {
  const latest = await BlockchainStatus.findOne().sort({ updatedAt: -1 });
  res.json(latest || {});
};

exports.updateStatus = async (req, res) => {
  const status = new BlockchainStatus(req.body);
  await status.save();
  res.status(201).json(status);
};

// Return a preview of how an election would be represented on-chain
exports.previewElection = async (req, res) => {
  const electionId = req.params.id;
  try {
    if (process.env.SKIP_DB === 'true') {
      // Mock preview
      return res.json({
        id: electionId,
        chainElectionId: null,
        seats: [{ name: 'Seat 1', index: 0, candidates: [{ name: 'Candidate A', chainCandidateId: 0 }] }],
        note: 'SKIP_DB mode - this is a mock preview'
      });
    }

    const Election = require('../models/Election');
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    // Map seats to candidates and (if available) chainCandidateId
    const seats = election.seats.map((s, idx) => ({
      name: s,
      index: idx,
      candidates: (election.candidates || []).filter(c => c.seat === s).map((c, i) => ({ name: c.name, chainCandidateId: c.chainCandidateId ?? i }))
    }));

    res.json({ id: election._id, chainElectionId: election.chainElectionId || null, seats, title: election.title });
  } catch (err) {
    res.status(500).json({ message: 'Error generating preview', error: err.message });
  }
};
