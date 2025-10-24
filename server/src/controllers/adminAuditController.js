const AuditLog = require('../models/AuditLog');
const VoteReceipt = require('../models/VoteReceipt');
const User = require('../models/User');
const Election = require('../models/Election');
const logger = require('../utils/logger');

// Get comprehensive audit dashboard data
exports.getAuditDashboard = async (req, res) => {
  try {
    const { startDate, endDate, action, userId } = req.query;
    
    // Build filter object
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (action) filter.action = action;
    if (userId) filter.performedBy = userId;

    // Get audit logs with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [auditLogs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    // Get audit statistics
    const stats = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get user activity summary
    const userActivity = await AuditLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$performedBy',
          actionCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' },
          actions: { $addToSet: '$action' }
        }
      },
      { $sort: { actionCount: -1 } },
      { $limit: 10 }
    ]);

    // Enrich user activity with user details
    const userIds = userActivity.map(ua => ua._id).filter(id => id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id fullName email role')
      .lean();

    const enrichedUserActivity = userActivity.map(activity => {
      const user = users.find(u => String(u._id) === String(activity._id));
      return {
        ...activity,
        user: user ? {
          id: user._id,
          name: user.fullName,
          email: user.email,
          role: user.role
        } : null
      };
    });

    return res.success({
      auditLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statistics: stats,
      userActivity: enrichedUserActivity
    });
  } catch (error) {
    logger.error('Error fetching audit dashboard:', error);
    return res.error(500, 'Error fetching audit dashboard', 4001, { error: error.message });
  }
};

// Get detailed audit trail for a specific user
exports.getUserAuditTrail = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate, action } = req.query;

    const filter = { performedBy: userId };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (action) filter.action = action;

    const auditLogs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    // Get user details
    const user = await User.findById(userId).select('_id fullName email role').lean();

    return res.success({
      user,
      auditLogs
    });
  } catch (error) {
    logger.error('Error fetching user audit trail:', error);
    return res.error(500, 'Error fetching user audit trail', 4002, { error: error.message });
  }
};

// Get vote audit trail
exports.getVoteAuditTrail = async (req, res) => {
  try {
    const { electionId } = req.query;
    
    const filter = { action: { $in: ['vote_cast', 'vote_cast_onchain'] } };
    if (electionId) {
      filter['details.electionId'] = electionId;
    }

    const voteLogs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    // Get vote receipts for additional verification
    const receiptFilter = {};
    if (electionId) receiptFilter.electionId = electionId;

    const voteReceipts = await VoteReceipt.find(receiptFilter)
      .sort({ votedAt: -1 })
      .limit(100)
      .populate('electionId', 'title')
      .lean();

    return res.success({
      voteLogs,
      voteReceipts
    });
  } catch (error) {
    logger.error('Error fetching vote audit trail:', error);
    return res.error(500, 'Error fetching vote audit trail', 4003, { error: error.message });
  }
};

// Get system security events
exports.getSecurityEvents = async (req, res) => {
  try {
    const securityActions = [
      'login_failed',
      'unauthorized_access',
      'rate_limit_exceeded',
      'suspicious_activity',
      'kyc_approved',
      'kyc_rejected',
      'admin_action'
    ];

    const securityLogs = await AuditLog.find({
      action: { $in: securityActions }
    })
    .sort({ timestamp: -1 })
    .limit(100)
    .lean();

    // Group by action type for summary
    const securitySummary = await AuditLog.aggregate([
      { $match: { action: { $in: securityActions } } },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          lastOccurrence: { $max: '$timestamp' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    return res.success({
      securityLogs,
      securitySummary
    });
  } catch (error) {
    logger.error('Error fetching security events:', error);
    return res.error(500, 'Error fetching security events', 4004, { error: error.message });
  }
};

// Export audit data
exports.exportAuditData = async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const auditLogs = await AuditLog.find(filter)
      .sort({ timestamp: -1 })
      .lean();

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = 'Timestamp,Action,Performed By,Details\n';
      const csvData = auditLogs.map(log => 
        `${log.timestamp},${log.action},${log.performedBy},"${JSON.stringify(log.details).replace(/"/g, '""')}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
      return res.send(csvHeaders + csvData);
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.json');
      return res.json(auditLogs);
    }
  } catch (error) {
    logger.error('Error exporting audit data:', error);
    return res.error(500, 'Error exporting audit data', 4005, { error: error.message });
  }
};
