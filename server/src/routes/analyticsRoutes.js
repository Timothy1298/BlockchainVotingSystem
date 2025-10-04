
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { mandatory } = require('../middleware/auth');
const requireAdmin = require('../middleware/roles')(['admin']);

router.use(mandatory);
// Summary analytics endpoint for dashboard
router.get('/', requireAdmin, analyticsController.summary);
router.get('/download', requireAdmin, analyticsController.downloadReports);
router.get('/turnout', requireAdmin, analyticsController.turnoutStats);
router.get('/vote-charts', requireAdmin, analyticsController.voteCharts);
router.get('/incidents', requireAdmin, analyticsController.incidentLogs);
router.get('/integrity', requireAdmin, analyticsController.integrityCheck);

module.exports = router;
