const User = require('../models/User');
const crypto = require('crypto');

exports.registerVoter = async (req, res) => {
  const { fullName, email, region } = req.body;
  const password = crypto.randomBytes(8).toString('hex');
  const user = new User({ fullName, email, region, password, role: 'voter' });
  await user.save();
  res.json(user);
};

exports.registerVotersCSV = async (req, res) => {
  // Assume req.file.buffer contains CSV data
  // Parse CSV and bulk create users
  // (Implementation omitted for brevity)
  res.json({ success: true, message: 'CSV upload not implemented in this stub.' });
};

exports.approveVoter = async (req, res) => {
  const { voterId } = req.params;
  await User.findByIdAndUpdate(voterId, { eligibility: 'Eligible' });
  res.json({ approved: true });
};

exports.rejectVoter = async (req, res) => {
  const { voterId } = req.params;
  await User.findByIdAndUpdate(voterId, { eligibility: 'Not Eligible' });
  res.json({ rejected: true });
};

exports.resetVoterAccess = async (req, res) => {
  const { voterId } = req.params;
  const newPassword = crypto.randomBytes(8).toString('hex');
  await User.findByIdAndUpdate(voterId, { password: newPassword });
  res.json({ reset: true, newPassword });
};

exports.blacklistVoter = async (req, res) => {
  const { voterId } = req.params;
  await User.findByIdAndUpdate(voterId, { eligibility: 'Not Eligible' });
  res.json({ blacklisted: true });
};

exports.generateToken = async (req, res) => {
  const { voterId } = req.params;
  const token = crypto.randomBytes(16).toString('hex');
  await User.findByIdAndUpdate(voterId, { voteReceipt: token });
  res.json({ token });
};
const Voter = require('../models/Voter');

exports.list = async (req, res) => {
  try {
    const voters = await Voter.find().populate('user', 'fullName email role');
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching voters', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const voter = await Voter.findById(req.params.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    Object.assign(voter, req.body);
    await voter.save();
    res.json(voter);
  } catch (err) {
    res.status(500).json({ message: 'Error updating voter', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const voter = await Voter.findByIdAndDelete(req.params.id);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    res.json({ message: 'Voter deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting voter', error: err.message });
  }
};
