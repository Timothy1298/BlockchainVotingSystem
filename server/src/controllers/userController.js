const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const AuditLog = require('../models/AuditLog');

// GET all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE current user profile
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const allowed = ['fullName', 'region', 'email', 'phone', 'address', 'bio'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    await user.save();
    
    // Log profile update
    await AuditLog.create({
      action: 'profile_updated',
      userId: req.user.id,
      details: {
        updatedFields: allowed.filter(field => req.body[field] !== undefined)
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Log password change
    await AuditLog.create({
      action: 'password_changed',
      userId: req.user.id,
      details: {
        passwordChangedAt: user.passwordChangedAt
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Setup 2FA
exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 2FA secret
    const secret = crypto.randomBytes(20).toString('hex');
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false; // Will be enabled after verification
    await user.save();

    // Log 2FA setup initiation
    await AuditLog.create({
      action: '2fa_setup_initiated',
      userId: req.user.id,
      details: {
        secretGenerated: true
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ 
      message: '2FA setup initiated',
      secret: secret,
      qrCode: `otpauth://totp/ElectionSystem:${user.email}?secret=${secret}&issuer=ElectionSystem`
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Verify 2FA setup
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: '2FA token is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.twoFactorSecret) {
      return res.status(400).json({ message: '2FA not set up. Please set up 2FA first.' });
    }

    // Simple token verification (in production, use proper TOTP library)
    const expectedToken = crypto.createHash('sha256')
      .update(user.twoFactorSecret + Math.floor(Date.now() / 30000))
      .digest('hex')
      .substring(0, 6);

    if (token !== expectedToken) {
      return res.status(400).json({ message: 'Invalid 2FA token' });
    }

    user.twoFactorEnabled = true;
    await user.save();

    // Log 2FA verification
    await AuditLog.create({
      action: '2fa_verified',
      userId: req.user.id,
      details: {
        twoFactorEnabled: true
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: '2FA verified and enabled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to disable 2FA' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    // Log 2FA disable
    await AuditLog.create({
      action: '2fa_disabled',
      userId: req.user.id,
      details: {
        twoFactorEnabled: false
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: '2FA disabled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get active sessions
exports.getActiveSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get recent login sessions from audit logs
    const sessions = await AuditLog.find({
      userId: req.user.id,
      action: 'login'
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .select('timestamp ipAddress userAgent')
    .lean();

    const activeSessions = sessions.map(session => ({
      id: session._id,
      timestamp: session.timestamp,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isCurrent: session.ipAddress === req.ip
    }));

    res.json({ sessions: activeSessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Logout other devices
exports.logoutOtherDevices = async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ message: 'Password is required to logout other devices' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate new session token to invalidate other sessions
    user.sessionToken = crypto.randomBytes(32).toString('hex');
    await user.save();

    // Log logout other devices
    await AuditLog.create({
      action: 'logout_other_devices',
      userId: req.user.id,
      details: {
        newSessionToken: user.sessionToken
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Other devices logged out successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update notification preferences
exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.notificationSettings = preferences;
    await user.save();

    // Log notification preferences update
    await AuditLog.create({
      action: 'notification_preferences_updated',
      userId: req.user.id,
      details: {
        preferences
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Notification preferences updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get security settings
exports.getSecuritySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const securitySettings = {
      twoFactorEnabled: user.twoFactorEnabled || false,
      passwordChangedAt: user.passwordChangedAt,
      lastLoginAt: user.lastLoginAt,
      loginAttempts: user.loginAttempts || 0,
      lockUntil: user.lockUntil,
      emailVerified: user.emailVerified || false,
      phoneVerified: user.phoneVerified || false
    };

    res.json(securitySettings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE user by ID (admin only)
exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Correct export:
exports.getAllUsers = exports.getAllUsers;
exports.getMe = exports.getMe;
exports.updateMe = exports.updateMe;
exports.getUserById = getUserById;
exports.deleteUser = exports.deleteUser;
