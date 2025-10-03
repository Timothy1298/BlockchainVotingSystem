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
