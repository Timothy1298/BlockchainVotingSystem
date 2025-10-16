// src/controllers/authController.js
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const config = require('../config');
const logger = require('../utils/logger');
const RefreshToken = require('../models/RefreshToken');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

exports.register = async (req, res) => {
  if (config.skipDb) {
    // Require simple validation in mock mode to avoid accidental empty submissions
    if (!req.body.email || !req.body.password) return res.error(400, 'Email and password are required (mock mode)', 4001);
    const mockUser = { id: 'mock-user-id', fullName: req.body.fullName || 'Dev User', email: req.body.email, role: req.body.role || 'user' };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, config.jwtSecret || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
    return res.success({ accessToken: token, refreshToken: null, user: mockUser });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.error(400, 'Validation failed', 4002, { errors: errors.array() });

  const { fullName, email: rawEmail, password, role } = req.body;
  const email = String(rawEmail || '').toLowerCase().trim();
    // If attempting to create an admin, require a registration key to prevent abuse
    if (role === 'admin') {
      const adminKey = config.adminRegistrationKey;
      const provided = req.headers['x-admin-key'] || req.body.adminKey;
      if (!adminKey) return res.error(403, 'Admin registration disabled. Set ADMIN_REGISTRATION_KEY to enable.', 4003);
      if (provided !== adminKey) return res.error(403, 'Invalid admin registration key', 4004);
    }

  let user = await User.findOne({ email });
    if (user) return res.error(400, 'Email already registered', 4005);

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

  user = new User({ fullName, email, password: hashed, role });
    await user.save();

    const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt: expires });
  return res.success({ accessToken, refreshToken, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } }, 'Registered');
  } catch (err) {
    logger.error('Registration error: %s', err?.message || err);
    return res.error(500, 'Server error', 4000, { error: err?.message });
  }
};

exports.login = async (req, res) => {
  if (config.skipDb) {
    const mockUser = { id: 'mock-user-id', fullName: 'Dev User', email: req.body.email || 'dev@example.com', role: 'user' };
    const token = jwt.sign({ id: mockUser.id, role: mockUser.role }, config.jwtSecret || 'dev-secret', { expiresIn: JWT_EXPIRES_IN });
    return res.success({ accessToken: token, refreshToken: null, user: mockUser });
  }

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.error(400, 'Validation failed', 4101, { errors: errors.array() });

    const { email: rawEmail, password } = req.body;
    const email = String(rawEmail || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) {
      logger.info('Login attempt: user not found for email %s', email);
      return res.error(400, 'Invalid credentials', 4102);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    logger.info('Login attempt: user found id=%s, bcryptMatch=%s', user._id?.toString?.() || 'n/a', isMatch);
    if (!isMatch) {
      return res.error(400, 'Invalid credentials', 4103);
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
    await RefreshToken.create({ token: refreshToken, user: user._id, expiresAt: expires });
    return res.success({ accessToken, refreshToken, user: { id: user._id, fullName: user.fullName, email: user.email, role: user.role } }, 'Authenticated');
  } catch (err) {
    logger.error('Login error: %s', err?.message || err);
    return res.error(500, 'Server error', 4100, { error: err?.message });
  }
};

// POST /api/auth/refresh
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.error(400, 'refreshToken required', 4201);
    const doc = await RefreshToken.findOne({ token: refreshToken, revoked: false });
    if (!doc || (doc.expiresAt && doc.expiresAt < new Date())) return res.error(401, 'Invalid or expired refresh token', 4202);
    const user = await User.findById(doc.user);
    if (!user) return res.error(401, 'Invalid token user', 4203);
    const accessToken = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, { expiresIn: JWT_EXPIRES_IN });
    return res.success({ accessToken }, 'Token refreshed');
  } catch (err) {
    logger.error('Refresh token error: %s', err?.message || err);
    return res.error(500, 'Server error', 4200);
  }
};

// POST /api/auth/revoke
exports.revoke = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.error(400, 'refreshToken required', 4301);
    const doc = await RefreshToken.findOne({ token: refreshToken });
    if (!doc) return res.error(404, 'Token not found', 4302);
    doc.revoked = true;
    await doc.save();
    return res.success(null, 'Token revoked');
  } catch (err) {
    logger.error('Revoke token error: %s', err?.message || err);
    return res.error(500, 'Server error', 4300);
  }
};
exports.forgotPassword = async (req, res) => {
  if (config.skipDb) return res.success(null, 'If that email exists, a reset link has been sent (mock mode)');
  try {
    const { email: rawEmail } = req.body;
    const email = String(rawEmail || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    // Always respond with success to prevent email enumeration
    if (!user) {
      return res.success(null, 'If that email exists, a reset link has been sent');
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

    return res.success(null, 'If that email exists, a reset link has been sent');
  } catch (err) {
    console.error('forgotPassword error', err);
    return res.error(500, 'Server error', 4400, { error: err?.message });
  }
}


exports.resetPassword = async (req, res) => {
  if (config.skipDb) return res.success(null, 'Password has been reset (mock mode)');
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!token) return res.error(400, 'Invalid or missing token', 4501);
    if (!password) return res.error(400, 'Password is required', 4502);

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ resetPasswordToken: tokenHash, resetPasswordExpires: { $gt: Date.now() } });
    if (!user) return res.error(400, 'Token is invalid or has expired', 4503);

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Optionally send confirmation email
    try { await sendEmail({ to: user.email, subject: 'Password changed', html: '<p>Your password was changed successfully.</p>' }); } catch (e) { console.warn('Failed to send password-changed email', e?.message || e); }

    return res.success(null, 'Password has been reset');
  } catch (err) {
    console.error('resetPassword error', err);
    return res.error(500, 'Server error', 4500, { error: err?.message });
  }
};


exports.me = async (req, res) => {
  if (config.skipDb) {
    const mockUser = { id: 'mock-user-id', fullName: 'Dev User', email: 'dev@example.com', role: 'user' };
    return res.success({ user: mockUser });
  }
  try {
    const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpires');
    return res.success({ user });
  } catch (err) {
    return res.error(500, 'Server error', 4600, { error: err?.message });
  }
};