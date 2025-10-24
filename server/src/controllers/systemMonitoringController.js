const AuditLog = require('../models/AuditLog');
const SystemLog = require('../models/SystemLog');
const Notification = require('../models/Notification');
const BlockchainStatus = require('../models/BlockchainStatus');
const User = require('../models/User');
const { ethers } = require('ethers');
const config = require('../config');
const crypto = require('crypto');

// F.6.1: Immutable System Logs
exports.getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, level, component } = req.query;
    const filter = {};
    
    if (level) filter.level = level;
    if (component) filter.component = component;
    
    const logs = await SystemLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await SystemLog.countDocuments(filter);
    
    res.json({
      logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching system logs', error: err.message });
  }
};

exports.createSystemLog = async (req, res) => {
  try {
    const { level, component, message, details } = req.body;
    
    const log = new SystemLog({
      level: level || 'info',
      component: component || 'system',
      message,
      details: details || {}
    });
    
    await log.save();
    
    // Create notification for critical logs
    if (level === 'error' || level === 'critical') {
      await Notification.create({
        type: 'system',
        title: `System ${level.toUpperCase()}: ${component}`,
        message: message,
        severity: level === 'critical' ? 'critical' : 'high',
        metadata: { logId: log._id, component }
      });
    }
    
    res.json(log);
  } catch (err) {
    res.status(500).json({ message: 'Error creating system log', error: err.message });
  }
};

exports.clearSystemLogs = async (req, res) => {
  try {
    const result = await SystemLog.deleteMany({});
    res.json({ 
      message: 'System logs cleared successfully', 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing system logs', error: err.message });
  }
};

exports.getLogStats = async (req, res) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = await SystemLog.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentStats = await SystemLog.aggregate([
      {
        $match: {
          timestamp: { $gte: last24h }
        }
      },
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const componentStats = await SystemLog.aggregate([
      {
        $group: {
          _id: '$component',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.json({
      total: await SystemLog.countDocuments(),
      last24h: await SystemLog.countDocuments({ timestamp: { $gte: last24h } }),
      last7d: await SystemLog.countDocuments({ timestamp: { $gte: last7d } }),
      byLevel: stats,
      recentByLevel: recentStats,
      topComponents: componentStats
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching log statistics', error: err.message });
  }
};

exports.getLogComponents = async (req, res) => {
  try {
    const components = await SystemLog.distinct('component');
    res.json(components.filter(c => c && c.trim() !== ''));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching log components', error: err.message });
  }
};

// F.6.2: Security & Fraud Notifications
exports.getSecurityNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, type } = req.query;
    const filter = { type: { $in: ['security', 'fraud'] } };
    
    if (severity) filter.severity = severity;
    if (type) filter.type = type;
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Notification.countDocuments(filter);
    
    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching security notifications', error: err.message });
  }
};

exports.createSecurityAlert = async (req, res) => {
  try {
    const { type, title, message, severity, metadata } = req.body;
    
    const notification = new Notification({
      type: type || 'security',
      title,
      message,
      severity: severity || 'medium',
      metadata: metadata || {}
    });
    
    await notification.save();
    
    // Log security alert
    await SystemLog.create({
      level: severity === 'critical' ? 'critical' : 'warning',
      component: 'security-monitor',
      message: `Security alert: ${title}`,
      details: { notificationId: notification._id, ...metadata }
    });
    
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: 'Error creating security alert', error: err.message });
  }
};

// F.6.3: Blockchain Node Health Monitor
exports.checkBlockchainHealth = async (req, res) => {
  try {
    const rpcUrl = config.blockchainRpc || 'http://127.0.0.1:8545';
    const startTime = Date.now();
    
    let healthStatus = {
      nodeUrl: rpcUrl,
      isHealthy: false,
      lastChecked: new Date(),
      responseTime: 0,
      errorMessage: null
    };
    
    try {
      // Create provider with timeout and retry settings
      const provider = new ethers.JsonRpcProvider(rpcUrl, undefined, {
        polling: false,
        staticNetwork: true
      });
      
      // Set a timeout for the health check
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Health check timeout')), 5000);
      });
      
      // Check basic connectivity with timeout
      const healthCheckPromise = Promise.all([
        provider.getBlockNumber(),
        provider.getNetwork(),
        provider.getFeeData()
      ]);
      
      const [blockNumber, network, gasPrice] = await Promise.race([
        healthCheckPromise,
        timeoutPromise
      ]);
      
      healthStatus.isHealthy = true;
      healthStatus.blockNumber = blockNumber;
      healthStatus.networkId = Number(network.chainId);
      healthStatus.gasPrice = gasPrice.gasPrice?.toString();
      healthStatus.responseTime = Date.now() - startTime;
      
    } catch (error) {
      healthStatus.isHealthy = false;
      healthStatus.errorMessage = error.message;
      healthStatus.responseTime = Date.now() - startTime;
    }
    
    // Save to database
    const blockchainStatus = new BlockchainStatus(healthStatus);
    await blockchainStatus.save();
    
    res.json(healthStatus);
  } catch (err) {
    res.status(500).json({ message: 'Error checking blockchain health', error: err.message });
  }
};

exports.getBlockchainStatus = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const statuses = await BlockchainStatus.find()
      .sort({ lastChecked: -1 })
      .limit(parseInt(limit));
    
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching blockchain status', error: err.message });
  }
};

// Security monitoring functions
exports.monitorFailedLogins = async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Find users with multiple failed login attempts
    const suspiciousUsers = await User.find({
      loginAttempts: { $gte: 3 },
      lastLogin: { $gte: since }
    }).select('email fullName loginAttempts lastLogin');
    
    // Create alerts for suspicious activity
    for (const user of suspiciousUsers) {
      await Notification.create({
        type: 'security',
        title: 'Multiple Failed Login Attempts',
        message: `User ${user.email} has ${user.loginAttempts} failed login attempts`,
        severity: user.loginAttempts >= 5 ? 'critical' : 'high',
        metadata: { userId: user._id, email: user.email, attempts: user.loginAttempts }
      });
    }
    
    res.json({
      suspiciousUsers,
      alertsCreated: suspiciousUsers.length,
      timeRange: `${hours} hours`
    });
  } catch (err) {
    res.status(500).json({ message: 'Error monitoring failed logins', error: err.message });
  }
};

exports.getAuditTrail = async (req, res) => {
  try {
    const { page = 1, limit = 50, action, performedBy, startDate, endDate } = req.query;
    const filter = {};
    
    if (action) filter.action = action;
    if (performedBy) filter.performedBy = performedBy;
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    const auditLogs = await AuditLog.find(filter)
      .populate('performedBy', 'fullName email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await AuditLog.countDocuments(filter);
    
    res.json({
      auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching audit trail', error: err.message });
  }
};

// Generate system health report
exports.getSystemHealthReport = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Get various metrics
    const [
      totalUsers,
      totalElections,
      recentLogs,
      blockchainStatus,
      notifications
    ] = await Promise.all([
      User.countDocuments(),
      require('../models/Election').countDocuments(),
      SystemLog.countDocuments({ createdAt: { $gte: last24Hours } }),
      BlockchainStatus.findOne().sort({ lastChecked: -1 }),
      Notification.countDocuments({ isRead: false })
    ]);
    
    const healthReport = {
      timestamp: now,
      system: {
        totalUsers,
        totalElections,
        recentLogs,
        unreadNotifications: notifications
      },
      blockchain: blockchainStatus || { isHealthy: false, errorMessage: 'No blockchain status available' },
      alerts: {
        critical: await Notification.countDocuments({ severity: 'critical', isRead: false }),
        high: await Notification.countDocuments({ severity: 'high', isRead: false }),
        medium: await Notification.countDocuments({ severity: 'medium', isRead: false })
      }
    };
    
    res.json(healthReport);
  } catch (err) {
    res.status(500).json({ message: 'Error generating system health report', error: err.message });
  }
};
