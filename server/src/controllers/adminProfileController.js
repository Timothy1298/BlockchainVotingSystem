const ApiKey = require('../models/ApiKey');
const Session = require('../models/Session');
const TwoFA = require('../models/TwoFA');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = {
  async getProfile(req, res) {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  },

  async updateProfile(req, res) {
    const { fullName, email, contact } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { fullName, email, contact }, { new: true }).select('-password');
    res.json(user);
  },

  async changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Old password incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true });
  },

  async enable2FA(req, res) {
    const { secret, backupCodes } = req.body;
    let twofa = await TwoFA.findOne({ user: req.user._id });
    if (!twofa) twofa = new TwoFA({ user: req.user._id, secret, backupCodes, enabled: true });
    else Object.assign(twofa, { secret, backupCodes, enabled: true });
    await twofa.save();
    res.json({ enabled: true });
  },

  async disable2FA(req, res) {
    await TwoFA.findOneAndUpdate({ user: req.user._id }, { enabled: false });
    res.json({ enabled: false });
  },

  async get2FA(req, res) {
    const twofa = await TwoFA.findOne({ user: req.user._id });
    res.json(twofa);
  },

  async listApiKeys(req, res) {
    const keys = await ApiKey.find({ user: req.user._id, revoked: false });
    res.json(keys);
  },

  async createApiKey(req, res) {
    const key = crypto.randomBytes(32).toString('hex');
    const apiKey = new ApiKey({ user: req.user._id, key, label: req.body.label });
    await apiKey.save();
    res.json(apiKey);
  },

  async revokeApiKey(req, res) {
    await ApiKey.findOneAndUpdate({ user: req.user._id, key: req.params.key }, { revoked: true });
    res.json({ revoked: true });
  },

  async listSessions(req, res) {
    const sessions = await Session.find({ user: req.user._id });
    res.json(sessions);
  },

  async revokeSession(req, res) {
    await Session.findOneAndUpdate({ user: req.user._id, _id: req.params.sessionId }, { valid: false });
    res.json({ revoked: true });
  }
};
