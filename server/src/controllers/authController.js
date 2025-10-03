// src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  if (process.env.SKIP_DB === 'true') {
    // Require simple validation in mock mode to avoid accidental empty submissions
    if (!req.body.email || !req.body.password) return res.status(400).json({ message: 'Email and password are required (mock mode)' });
    const mockUser = { id: 'mock-user-id', fullName: req.body.fullName || 'Dev User', email: req.body.email, role: req.body.role || 'user' };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: mockUser });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, password, role } = req.body;
    // If attempting to create an admin, require a registration key to prevent abuse
    if (role === 'admin') {
      const adminKey = process.env.ADMIN_REGISTRATION_KEY;
      const provided = req.headers['x-admin-key'] || req.body.adminKey;
      if (!adminKey) return res.status(403).json({ message: 'Admin registration disabled. Set ADMIN_REGISTRATION_KEY to enable.' });
      if (provided !== adminKey) return res.status(403).json({ message: 'Invalid admin registration key' });
    }
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ fullName, email, password: hashed, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  if (process.env.SKIP_DB === 'true') {
    const mockUser = { id: 'mock-user-id', fullName: 'Dev User', email: req.body.email || 'dev@example.com', role: 'user' };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
    return res.json({ token, user: mockUser });
  }
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    res.json({ token, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.forgotPassword = async (req, res) => {
  if (process.env.SKIP_DB === 'true') return res.json({ message: 'If that email exists, a reset link has been sent (mock mode)' });
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.json({ message: 'If that email exists, a reset link has been sent' });
    }

    // Create token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    const html = `
    <p>You requested a password reset.</p>
    <p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p>
    `;

    await sendEmail({ to: user.email, subject: 'Reset your password', html });

    return res.json({ message: 'If that email exists, a reset link has been sent' });
  } catch (err) {
    console.error('forgotPassword error', err);
    res.status(500).json({ message: 'Server error' });
  }
}


exports.resetPassword = async (req, res) => {
  if (process.env.SKIP_DB === 'true') return res.json({ message: 'Password has been reset (mock mode)' });
try {
const { token } = req.params;
const { password } = req.body;
if (!token) return res.status(400).json({ message: 'Invalid or missing token' });
if (!password) return res.status(400).json({ message: 'Password is required' });


const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: Date.now() } });
if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });


const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password, salt);
user.resetPasswordToken = undefined;
user.resetPasswordExpires = undefined;
await user.save();


// Optionally send confirmation email
await sendEmail({ to: user.email, subject: 'Password changed', html: '<p>Your password was changed successfully.</p>' });


res.json({ message: 'Password has been reset' });
} catch (err) {
console.error('resetPassword error', err);
res.status(500).json({ message: 'Server error' });
}
};


exports.me = async (req, res) => {
  if (process.env.SKIP_DB === 'true') {
    // If token is present, return a mocked user (extract minimal info if possible)
    const mockUser = { id: 'mock-user-id', fullName: 'Dev User', email: 'dev@example.com', role: 'user' };
    return res.json({ user: mockUser });
  }
try {
const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
res.json({ user });
} catch (err) {
res.status(500).json({ message: 'Server error' });
}
};