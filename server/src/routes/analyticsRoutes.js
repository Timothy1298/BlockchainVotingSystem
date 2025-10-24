const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

// Apply authentication to all routes
router.use(mandatory);

// F.6.3: Blockchain Performance Metrics
router.get('/blockchain-performance', analyticsController.getBlockchainPerformance);

// F.6.3: Turnout Reports
router.get('/turnout-reports', requireRole(['admin', 'auditor']), analyticsController.getTurnoutReports);

// F.5.2: Post-Election Audit Reports
router.get('/audit-report/:electionId', requireRole(['admin', 'auditor']), analyticsController.generateAuditReport);

// F.6.3: Geographic/Browser Breakdown
router.get('/geographic-breakdown', requireRole(['admin', 'auditor']), analyticsController.getGeographicBreakdown);

module.exports = router;