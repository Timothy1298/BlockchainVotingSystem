
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const User = require('../models/User');
const fs = require('fs');

module.exports.listRoles = async (req, res) => {
  res.json(['Super Admin', 'Admin', 'Election Manager', 'Observer']);
};

module.exports.setRole = async (req, res) => {
  const { userId, role } = req.body;
  await User.findByIdAndUpdate(userId, { role });
  res.json({ success: true });
};

module.exports.exportAuditLogs = async (req, res) => {
  const logs = await AuditLog.find();
  const format = req.query.format || 'csv';
  if (format === 'csv') {
    const csv = logs.map(l => `${l.timestamp},${l.user},${l.action},${l.details}`).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
  } else if (format === 'json') {
    res.json(logs);
  } else {
    res.status(400).json({ error: 'Unsupported format' });
  }
};

module.exports.listNotifications = async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json(notifications);
};

module.exports.setNotificationSettings = async (req, res) => {
  // Save notification settings (mocked)
  res.json({ success: true });
};

module.exports.setLocalization = async (req, res) => {
  // Save language/localization settings (mocked)
  res.json({ success: true });
};

module.exports.setIntegration = async (req, res) => {
  // Save integration settings (mocked)
  res.json({ success: true });
};
const Ballot = require('../models/Ballot');

module.exports.createElection = async (req, res) => {
  const { title, electionType, seats, description, startsAt, endsAt } = req.body;
  const election = new Election({
    title, electionType, seats, description, startsAt, endsAt, createdBy: req.user._id
  });
  await election.save();
  res.json(election);
};

module.exports.updateElection = async (req, res) => {
  const { id } = req.params;
  const { title, description, startsAt, endsAt } = req.body;
  const election = await Election.findByIdAndUpdate(id, { title, description, startsAt, endsAt }, { new: true });
  res.json(election);
};

module.exports.setRules = async (req, res) => {
  const { electionId } = req.params;
  const { oneVotePerId, anonymous, eligibility } = req.body;
  let ballot = await Ballot.findOne({ election: electionId });
  if (!ballot) ballot = new Ballot({ election: electionId });
  ballot.rules = { oneVotePerId, anonymous, eligibility };
  await ballot.save();
  res.json(ballot);
};

module.exports.setPhases = async (req, res) => {
  const { electionId } = req.params;
  const { phases } = req.body; // [{name, start, end}]
  let ballot = await Ballot.findOne({ election: electionId });
  if (!ballot) ballot = new Ballot({ election: electionId });
  ballot.phases = phases;
  await ballot.save();
  res.json(ballot);
};

module.exports.setBallotStructure = async (req, res) => {
  const { electionId } = req.params;
  const { structure } = req.body; // 'single', 'multiple', 'ranked'
  let ballot = await Ballot.findOne({ election: electionId });
  if (!ballot) ballot = new Ballot({ election: electionId });
  ballot.structure = structure;
  await ballot.save();
  res.json(ballot);
};

module.exports.getElectionSettings = async (req, res) => {
  const { electionId } = req.params;
  const election = await Election.findById(electionId);
  const ballot = await Ballot.findOne({ election: electionId });
  res.json({ election, ballot });
};
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
