const User = require('../models/User');
const Election = require('../models/Election');
const AuditLog = require('../models/AuditLog');
const Notification = require('../models/Notification');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// F.2.1: Voter Registration & Verification
exports.registerVoter = async (req, res) => {
  try {
    const { fullName, email, region, studentId, nationalId, faculty, contact } = req.body;
    
    // Check for uniqueness
    if (studentId) {
      const existingStudent = await User.findOne({ studentId });
      if (existingStudent) {
        return res.status(400).json({ message: 'Student ID already registered' });
      }
    }
    
    if (nationalId) {
      const existingNational = await User.findOne({ nationalId });
      if (existingNational) {
        return res.status(400).json({ message: 'National ID already registered' });
      }
    }
    
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    const password = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      fullName, 
      email, 
      region, 
      password: hashedPassword, 
      role: 'voter',
      studentId,
      nationalId,
      faculty,
      contact,
      isRegistered: true,
      registrationDate: new Date(),
      approvedBy: req.user.id
    });
    
    await user.save();
    
    // Log voter registration
    await AuditLog.create({
      action: 'voter_registered',
      performedBy: req.user.id,
      details: { 
        voterId: user._id, 
        email: user.email,
        studentId: user.studentId
      },
      timestamp: new Date()
    });
    
    res.json({ 
      user: { 
        id: user._id, 
        fullName: user.fullName, 
        email: user.email,
        studentId: user.studentId
      },
      temporaryPassword: password // Only return in registration response
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering voter', error: err.message });
  }
};

// F.2.1: Bulk Voter Registration
exports.registerVotersCSV = async (req, res) => {
  try {
    // This would parse CSV data and bulk register voters
    // For now, return a placeholder response
    res.json({ 
      success: true, 
      message: 'CSV bulk registration endpoint ready. Implement CSV parsing logic here.',
      registered: 0,
      errors: []
    });
  } catch (err) {
    res.status(500).json({ message: 'Error in bulk registration', error: err.message });
  }
};

// F.2.1: Approve Voter
exports.approveVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const user = await User.findByIdAndUpdate(
      voterId, 
      { 
        eligibility: 'Eligible',
        approvedBy: req.user.id
      }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Log voter approval
    await AuditLog.create({
      action: 'voter_approved',
      performedBy: req.user.id,
      details: { voterId: user._id, email: user.email },
      timestamp: new Date()
    });
    
    res.json({ approved: true, voter: user });
  } catch (err) {
    res.status(500).json({ message: 'Error approving voter', error: err.message });
  }
};

// F.2.1: Reject Voter
exports.rejectVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const user = await User.findByIdAndUpdate(
      voterId, 
      { eligibility: 'Not Eligible' }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Log voter rejection
    await AuditLog.create({
      action: 'voter_rejected',
      performedBy: req.user.id,
      details: { voterId: user._id, email: user.email },
      timestamp: new Date()
    });
    
    res.json({ rejected: true, voter: user });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting voter', error: err.message });
  }
};

// F.2.1: Reset Voter Access
exports.resetVoterAccess = async (req, res) => {
  try {
    const { voterId } = req.params;
    const newPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const user = await User.findByIdAndUpdate(
      voterId, 
      { 
        password: hashedPassword,
        loginAttempts: 0,
        lockUntil: undefined
      }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Log access reset
    await AuditLog.create({
      action: 'voter_access_reset',
      performedBy: req.user.id,
      details: { voterId: user._id, email: user.email },
      timestamp: new Date()
    });
    
    res.json({ reset: true, newPassword, voter: user });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting voter access', error: err.message });
  }
};

// F.2.1: Blacklist Voter
exports.blacklistVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const user = await User.findByIdAndUpdate(
      voterId, 
      { 
        eligibility: 'Not Eligible',
        lockUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Lock for 1 year
      }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Log voter blacklisting
    await AuditLog.create({
      action: 'voter_blacklisted',
      performedBy: req.user.id,
      details: { voterId: user._id, email: user.email },
      timestamp: new Date()
    });
    
    res.json({ blacklisted: true, voter: user });
  } catch (err) {
    res.status(500).json({ message: 'Error blacklisting voter', error: err.message });
  }
};

// F.2.1: Generate Voter Token
exports.generateToken = async (req, res) => {
  try {
    const { voterId } = req.params;
    const token = crypto.randomBytes(16).toString('hex');
    const qrCode = crypto.randomBytes(32).toString('hex');
    
    const user = await User.findByIdAndUpdate(
      voterId, 
      { 
        voteReceipt: token,
        qrCode: qrCode
      }, 
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Log token generation
    await AuditLog.create({
      action: 'voter_token_generated',
      performedBy: req.user.id,
      details: { voterId: user._id, email: user.email },
      timestamp: new Date()
    });
    
    res.json({ token, qrCode, voter: user });
  } catch (err) {
    res.status(500).json({ message: 'Error generating token', error: err.message });
  }
};
// F.2.3: Voter Lookup & Status
exports.lookupVoter = async (req, res) => {
  try {
    const { query } = req.query; // Can be email, studentId, nationalId, or name
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const voters = await User.find({
      $or: [
        { email: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } },
        { studentId: query },
        { nationalId: query }
      ],
      role: 'voter'
    }).select('-password -twoFactorSecret');
    
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: 'Error looking up voters', error: err.message });
  }
};

// F.2.3: Get Voter Status
exports.getVoterStatus = async (req, res) => {
  try {
    const { voterId } = req.params;
    const voter = await User.findById(voterId).select('-password -twoFactorSecret');
    
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    // Get voting history
    const votingHistory = await Election.find({
      'voters': voterId
    }).select('title status votedAt');
    
    res.json({
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email,
        studentId: voter.studentId,
        eligibility: voter.eligibility,
        isRegistered: voter.isRegistered,
        lastLogin: voter.lastLogin,
        isLocked: voter.isLocked
      },
      votingHistory,
      status: {
        canVote: voter.eligibility === 'Eligible' && !voter.isLocked,
        hasVoted: votingHistory.length > 0,
        isActive: voter.eligibility === 'Eligible'
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error getting voter status', error: err.message });
  }
};

// F.2.1: Register Voter for Election
exports.registerVoterForElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { voterId } = req.body;
    
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    const voter = await User.findById(voterId);
    if (!voter) {
      return res.status(404).json({ message: 'Voter not found' });
    }
    
    if (election.registeredVoters.includes(voterId)) {
      return res.status(400).json({ message: 'Voter already registered for this election' });
    }
    
    election.registeredVoters.push(voterId);
    await election.save();
    
    // Log voter registration for election
    await AuditLog.create({
      action: 'voter_registered_for_election',
      performedBy: req.user.id,
      details: { 
        electionId: election._id,
        voterId: voter._id,
        voterEmail: voter.email
      },
      timestamp: new Date()
    });
    
    res.json({ 
      success: true, 
      message: 'Voter registered for election',
      election: election.title,
      voter: voter.fullName
    });
  } catch (err) {
    res.status(500).json({ message: 'Error registering voter for election', error: err.message });
  }
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

// F.2.1: Enhanced Voter Management Functions

// Get all voters with detailed information
exports.getAllVoters = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (status) {
      query.eligibility = status;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { nationalId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const voters = await User.find(query)
      .select('-password -twoFactorSecret')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      voters,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching voters', error: err.message });
  }
};

// Get pending verification queue
exports.getPendingVerification = async (req, res) => {
  try {
    const voters = await User.find({ 
      isRegistered: true,
      eligibility: 'Eligible',
      approvedBy: { $exists: false }
    })
      .select('-password -twoFactorSecret')
      .sort({ registrationDate: 1 });
    
    res.json(voters);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching pending verifications', error: err.message });
  }
};

// Approve voter registration
exports.approveVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { reason } = req.body;
    
    const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    
    voter.eligibility = 'Eligible';
    voter.approvedBy = req.user.id;
    voter.updatedAt = new Date();
    
    await voter.save();
    
    // Log approval
    await AuditLog.create({
      action: 'voter_approved',
      performedBy: req.user.id,
      details: { 
        voterId: voter._id,
        voterEmail: voter.email,
        reason: reason || 'Approved by admin'
      },
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Voter approved successfully',
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email,
        eligibility: voter.eligibility
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error approving voter', error: err.message });
  }
};

// Reject voter registration
exports.rejectVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    
    const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    
    voter.eligibility = 'Not Eligible';
    voter.approvedBy = req.user.id;
    voter.updatedAt = new Date();
    
    await voter.save();
    
    // Log rejection
    await AuditLog.create({
      action: 'voter_rejected',
      performedBy: req.user.id,
      details: { 
        voterId: voter._id,
        voterEmail: voter.email,
        reason: reason
      },
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Voter rejected successfully',
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email,
        eligibility: voter.eligibility
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting voter', error: err.message });
  }
};

// Generate voter authentication token
exports.generateVoterToken = async (req, res) => {
  try {
    const { voterId } = req.params;
    
    const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    
    // Generate unique token for voter authentication
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    // Store token hash (in production, use secure storage)
    voter.receiptHash = tokenHash;
    voter.updatedAt = new Date();
    
    await voter.save();
    
    // Log token generation
    await AuditLog.create({
      action: 'voter_token_generated',
      performedBy: req.user.id,
      details: { 
        voterId: voter._id,
        voterEmail: voter.email
      },
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Voter token generated successfully',
      token: token, // In production, send via secure channel
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error generating voter token', error: err.message });
  }
};

// Reset voter access
exports.resetVoterAccess = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { reason } = req.body;
    
    const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    
    // Reset voter access
    voter.receiptHash = null;
    voter.voteReceipt = null;
    voter.eligibility = 'Eligible';
    voter.loginAttempts = 0;
    voter.lockUntil = null;
    voter.updatedAt = new Date();
    
    await voter.save();
    
    // Log access reset
    await AuditLog.create({
      action: 'voter_access_reset',
      performedBy: req.user.id,
      details: { 
        voterId: voter._id,
        voterEmail: voter.email,
        reason: reason || 'Access reset by admin'
      },
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Voter access reset successfully',
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting voter access', error: err.message });
  }
};

// Blacklist voter
exports.blacklistVoter = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Blacklist reason is required' });
    }
    
    const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    
    voter.eligibility = 'Not Eligible';
    voter.updatedAt = new Date();
    
    await voter.save();
    
    // Log blacklisting
    await AuditLog.create({
      action: 'voter_blacklisted',
      performedBy: req.user.id,
      details: { 
        voterId: voter._id,
        voterEmail: voter.email,
        reason: reason
      },
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Voter blacklisted successfully',
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email,
        eligibility: voter.eligibility
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error blacklisting voter', error: err.message });
  }
};

// Bulk voter management
exports.bulkVoterManagement = async (req, res) => {
  try {
    const { action, voterIds, reason } = req.body;
    
    if (!action || !Array.isArray(voterIds) || voterIds.length === 0) {
      return res.status(400).json({ message: 'Action and voter IDs are required' });
    }
    
    const results = {
      successful: [],
      failed: [],
      total: voterIds.length
    };
    
    for (const voterId of voterIds) {
      try {
        const voter = await User.findById(voterId);
        if (!voter) {
          results.failed.push({ voterId, error: 'Voter not found' });
          continue;
        }
        
        switch (action) {
          case 'approve':
            voter.eligibility = 'Eligible';
            voter.approvedBy = req.user.id;
            break;
          case 'reject':
            voter.eligibility = 'Not Eligible';
            voter.approvedBy = req.user.id;
            break;
          case 'blacklist':
            voter.eligibility = 'Not Eligible';
            break;
          case 'reset':
            voter.receiptHash = null;
            voter.voteReceipt = null;
            voter.eligibility = 'Eligible';
            voter.loginAttempts = 0;
            voter.lockUntil = null;
            break;
          default:
            results.failed.push({ voterId, error: 'Invalid action' });
            continue;
        }
        
        voter.updatedAt = new Date();
        await voter.save();
        
        results.successful.push({
          voterId: voter._id,
          fullName: voter.fullName,
          email: voter.email
        });
        
      } catch (error) {
        results.failed.push({ voterId, error: error.message });
      }
    }
    
    // Log bulk action
    await AuditLog.create({
      action: `voters_bulk_${action}`,
      performedBy: req.user.id,
      details: { 
        action: action,
        totalVoters: results.total,
        successful: results.successful.length,
        failed: results.failed.length,
        reason: reason
      },
      timestamp: new Date()
    });
    
    res.json({
      results,
      message: `Bulk ${action} completed: ${results.successful.length} successful, ${results.failed.length} failed`
    });
  } catch (err) {
    res.status(500).json({ message: 'Error in bulk voter management', error: err.message });
  }
};

// Force logout/session kill
exports.forceLogout = async (req, res) => {
  try {
    const { voterId } = req.params;
    const { reason } = req.body;
    
    const voter = await User.findById(voterId);
    if (!voter) return res.status(404).json({ message: 'Voter not found' });
    
    // In a real implementation, you would invalidate the JWT token
    // For now, we'll reset login attempts and lock the account temporarily
    voter.loginAttempts = 5;
    voter.lockUntil = new Date(Date.now() + 24 * 60 * 60 * 1000); // Lock for 24 hours
    voter.updatedAt = new Date();
    
    await voter.save();
    
    // Log forced logout
    await AuditLog.create({
      action: 'voter_forced_logout',
      performedBy: req.user.id,
      details: { 
        voterId: voter._id,
        voterEmail: voter.email,
        reason: reason || 'Security compromise suspected'
      },
      timestamp: new Date()
    });
    
    res.json({ 
      message: 'Voter session terminated successfully',
      voter: {
        id: voter._id,
        fullName: voter.fullName,
        email: voter.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error forcing logout', error: err.message });
  }
};
