const express = require('express');
const router = express.Router();
const { 
  getAuditDashboard, 
  getUserAuditTrail, 
  getVoteAuditTrail, 
  getSecurityEvents,
  exportAuditData 
} = require('../controllers/adminAuditController');
const { mandatory } = require('../middleware/auth');

// All routes require authentication
router.use(mandatory);

// Get comprehensive audit dashboard data
router.get('/dashboard', getAuditDashboard);

// Get detailed audit trail for a specific user
router.get('/user/:userId', getUserAuditTrail);

// Get vote audit trail
router.get('/votes', getVoteAuditTrail);

// Get system security events
router.get('/security', getSecurityEvents);

// Export audit data
router.get('/export', exportAuditData);

module.exports = router;
