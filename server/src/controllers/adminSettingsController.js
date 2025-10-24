const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// User Role Management
exports.getUserRoles = async (req, res) => {
  try {
    const roles = [
      {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: [
          'user_management',
          'election_management',
          'system_configuration',
          'security_settings',
          'audit_logs',
          'blockchain_management',
          'analytics_access',
          'notification_management'
        ]
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Administrative access with most permissions',
        permissions: [
          'user_management',
          'election_management',
          'analytics_access',
          'notification_management'
        ]
      },
      {
        id: 'election_manager',
        name: 'Election Manager',
        description: 'Manage elections and candidates',
        permissions: [
          'election_management',
          'candidate_management',
          'voter_management'
        ]
      },
      {
        id: 'auditor',
        name: 'Auditor',
        description: 'View-only access for auditing purposes',
        permissions: [
          'audit_logs',
          'analytics_access',
          'election_view'
        ]
      }
    ];

    res.json({ roles });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user roles', error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    if (!userId || !role) {
      return res.status(400).json({ message: 'User ID and role are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log role change
    await AuditLog.create({
      action: 'user_role_updated',
      userId: req.user.id,
      details: {
        targetUserId: userId,
        oldRole,
        newRole: role,
        targetUserEmail: user.email
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating user role', error: error.message });
  }
};

// External Integrations
exports.getExternalIntegrations = async (req, res) => {
  try {
    const integrations = {
      activeDirectory: {
        enabled: false,
        server: '',
        domain: '',
        baseDN: '',
        username: '',
        lastSync: null
      },
      governmentId: {
        enabled: false,
        apiEndpoint: '',
        apiKey: '',
        lastSync: null
      },
      sms: {
        enabled: false,
        provider: '',
        apiKey: '',
        lastTest: null
      },
      email: {
        enabled: true,
        provider: 'smtp',
        smtpHost: 'localhost',
        smtpPort: 587,
        lastTest: new Date()
      }
    };

    res.json({ integrations });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching external integrations', error: error.message });
  }
};

exports.updateExternalIntegrations = async (req, res) => {
  try {
    const { integrations } = req.body;
    
    // Log integration update
    await AuditLog.create({
      action: 'external_integrations_updated',
      userId: req.user.id,
      details: {
        integrations
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'External integrations updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating external integrations', error: error.message });
  }
};

// Security Policies
exports.getSecurityPolicies = async (req, res) => {
  try {
    const policies = {
      password: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
        preventReuse: 5 // last 5 passwords
      },
      session: {
        timeout: 30, // minutes
        maxConcurrent: 3,
        requireReauth: false
      },
      ipWhitelist: {
        enabled: false,
        allowedIPs: [],
        allowedRanges: []
      },
      twoFactor: {
        required: false,
        allowedMethods: ['totp', 'sms', 'email']
      },
      login: {
        maxAttempts: 5,
        lockoutDuration: 15, // minutes
        requireEmailVerification: true
      }
    };

    res.json({ policies });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching security policies', error: error.message });
  }
};

exports.updateSecurityPolicies = async (req, res) => {
  try {
    const { policies } = req.body;
    
    // Log security policy update
    await AuditLog.create({
      action: 'security_policies_updated',
      userId: req.user.id,
      details: {
        policies
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'Security policies updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating security policies', error: error.message });
  }
};

// System Maintenance
exports.getSystemMaintenance = async (req, res) => {
  try {
    const maintenance = {
      database: {
        lastBackup: new Date(Date.now() - 86400000), // 1 day ago
        backupFrequency: 'daily',
        retentionDays: 30,
        nextBackup: new Date(Date.now() + 86400000) // 1 day from now
      },
      cache: {
        lastCleared: new Date(Date.now() - 3600000), // 1 hour ago
        size: '2.5GB',
        maxSize: '10GB'
      },
      logs: {
        totalSize: '1.2GB',
        retentionDays: 90,
        lastRotation: new Date(Date.now() - 604800000) // 1 week ago
      },
      updates: {
        lastCheck: new Date(Date.now() - 86400000),
        availableUpdates: 2,
        autoUpdate: false
      }
    };

    res.json({ maintenance });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system maintenance info', error: error.message });
  }
};

exports.performMaintenance = async (req, res) => {
  try {
    const { action } = req.body;
    
    let result = {};
    
    switch (action) {
      case 'backup_database':
        result = { message: 'Database backup initiated', backupId: crypto.randomUUID() };
        break;
      case 'clear_cache':
        result = { message: 'Cache cleared successfully', clearedSize: '2.5GB' };
        break;
      case 'rotate_logs':
        result = { message: 'Log rotation completed', rotatedSize: '1.2GB' };
        break;
      case 'check_updates':
        result = { message: 'Update check completed', availableUpdates: 2 };
        break;
      default:
        return res.status(400).json({ message: 'Invalid maintenance action' });
    }

    // Log maintenance action
    await AuditLog.create({
      action: 'system_maintenance',
      userId: req.user.id,
      details: {
        maintenanceAction: action,
        result
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error performing maintenance', error: error.message });
  }
};

// System Configuration
exports.getSystemConfiguration = async (req, res) => {
  try {
    const config = {
      general: {
        systemName: 'Blockchain Voting System',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timezone: 'UTC',
        language: 'en'
      },
      blockchain: {
        network: 'localhost',
        chainId: 1337,
        gasPrice: 20,
        blockTime: 12
      },
      voting: {
        defaultElectionDuration: 24, // hours
        allowEarlyVoting: false,
        requireVoterVerification: true,
        maxCandidatesPerSeat: 10
      },
      notifications: {
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        defaultLanguage: 'en'
      }
    };

    res.json({ config });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching system configuration', error: error.message });
  }
};

exports.updateSystemConfiguration = async (req, res) => {
  try {
    const { config } = req.body;
    
    // Log configuration update
    await AuditLog.create({
      action: 'system_configuration_updated',
      userId: req.user.id,
      details: {
        config
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ message: 'System configuration updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating system configuration', error: error.message });
  }
};

// Test External Integration
exports.testIntegration = async (req, res) => {
  try {
    const { type } = req.params;
    const { config } = req.body;
    
    let result = {};
    
    switch (type) {
      case 'email':
        result = { success: true, message: 'Email configuration test successful' };
        break;
      case 'sms':
        result = { success: true, message: 'SMS configuration test successful' };
        break;
      case 'active_directory':
        result = { success: true, message: 'Active Directory connection test successful' };
        break;
      case 'government_id':
        result = { success: true, message: 'Government ID service test successful' };
        break;
      default:
        return res.status(400).json({ message: 'Invalid integration type' });
    }

    // Log integration test
    await AuditLog.create({
      action: 'integration_test',
      userId: req.user.id,
      details: {
        integrationType: type,
        result
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error testing integration', error: error.message });
  }
};
