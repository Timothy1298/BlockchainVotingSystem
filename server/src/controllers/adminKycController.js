const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

// Get all pending KYC applications
exports.getPendingKycApplications = async (req, res) => {
  try {
    const pendingApplications = await User.find({
      'kycInfo.verification.status': 'pending',
      role: 'voter'
    }).select('_id fullName email kycInfo createdAt').lean();

    const formattedApplications = pendingApplications.map(user => ({
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      submittedAt: user.createdAt,
      kycInfo: {
        address: user.kycInfo?.address || {},
        documents: user.kycInfo?.documents || {},
        biometricInfo: user.kycInfo?.biometricInfo || {},
        verification: user.kycInfo?.verification || {}
      }
    }));

    return res.success(formattedApplications);
  } catch (error) {
    logger.error('Error fetching pending KYC applications:', error);
    return res.error(500, 'Error fetching KYC applications', 3001, { error: error.message });
  }
};

// Get KYC application details
exports.getKycApplicationDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select('_id fullName email kycInfo createdAt');
    if (!user) {
      return res.error(404, 'User not found', 3002);
    }

    if (user.role !== 'voter') {
      return res.error(400, 'User is not a voter', 3003);
    }

    const applicationDetails = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      submittedAt: user.createdAt,
      kycInfo: user.kycInfo || {}
    };

    return res.success(applicationDetails);
  } catch (error) {
    logger.error('Error fetching KYC application details:', error);
    return res.error(500, 'Error fetching application details', 3004, { error: error.message });
  }
};

// Approve KYC application
exports.approveKycApplication = async (req, res) => {
  try {
    const { userId } = req.params;
    const { notes } = req.body;
    const adminId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 3005);
    }

    if (user.role !== 'voter') {
      return res.error(400, 'User is not a voter', 3006);
    }

    if (user.kycInfo?.verification?.status !== 'pending') {
      return res.error(400, 'KYC application is not pending', 3007);
    }

    // Update KYC status
    user.kycInfo.verification.status = 'approved';
    user.kycInfo.verification.approvedAt = new Date();
    user.kycInfo.verification.approvedBy = adminId;
    user.kycInfo.verification.notes = notes || '';

    await user.save();

    // Log the approval
    await AuditLog.create({
      action: 'kyc_approved',
      performedBy: adminId,
      details: {
        userId: userId,
        userEmail: user.email,
        notes: notes
      },
      timestamp: new Date()
    });

    logger.info(`KYC application approved for user ${user.email} by admin ${adminId}`);

    return res.success({ 
      message: 'KYC application approved successfully',
      userId: userId,
      status: 'approved'
    });
  } catch (error) {
    logger.error('Error approving KYC application:', error);
    return res.error(500, 'Error approving KYC application', 3008, { error: error.message });
  }
};

// Reject KYC application
exports.rejectKycApplication = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, notes } = req.body;
    const adminId = req.user.id;

    if (!reason) {
      return res.error(400, 'Rejection reason is required', 3009);
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.error(404, 'User not found', 3010);
    }

    if (user.role !== 'voter') {
      return res.error(400, 'User is not a voter', 3011);
    }

    if (user.kycInfo?.verification?.status !== 'pending') {
      return res.error(400, 'KYC application is not pending', 3012);
    }

    // Update KYC status
    user.kycInfo.verification.status = 'rejected';
    user.kycInfo.verification.rejectedAt = new Date();
    user.kycInfo.verification.rejectedBy = adminId;
    user.kycInfo.verification.rejectionReason = reason;
    user.kycInfo.verification.notes = notes || '';

    await user.save();

    // Log the rejection
    await AuditLog.create({
      action: 'kyc_rejected',
      performedBy: adminId,
      details: {
        userId: userId,
        userEmail: user.email,
        reason: reason,
        notes: notes
      },
      timestamp: new Date()
    });

    logger.info(`KYC application rejected for user ${user.email} by admin ${adminId}. Reason: ${reason}`);

    return res.success({ 
      message: 'KYC application rejected successfully',
      userId: userId,
      status: 'rejected',
      reason: reason
    });
  } catch (error) {
    logger.error('Error rejecting KYC application:', error);
    return res.error(500, 'Error rejecting KYC application', 3013, { error: error.message });
  }
};

// Get KYC statistics
exports.getKycStatistics = async (req, res) => {
  try {
    const stats = await User.aggregate([
      { $match: { role: 'voter' } },
      {
        $group: {
          _id: '$kycInfo.verification.status',
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      const status = stat._id || 'pending';
      formattedStats[status] = stat.count;
      formattedStats.total += stat.count;
    });

    return res.success(formattedStats);
  } catch (error) {
    logger.error('Error fetching KYC statistics:', error);
    return res.error(500, 'Error fetching KYC statistics', 3014, { error: error.message });
  }
};
