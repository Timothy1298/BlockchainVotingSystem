const express = require('express');
const router = express.Router();
const { mandatory, optional } = require('../middleware/auth');
const roles = require('../middleware/roles');
const systemMonitoringController = require('../controllers/systemMonitoringController');

// Public health endpoints (no authentication required)
router.get('/health-report', systemMonitoringController.getSystemHealthReport);
router.get('/blockchain/health', systemMonitoringController.checkBlockchainHealth);

// Protected endpoints (require authentication)
router.use(mandatory);

// F.6.1: Immutable System Logs
router.get('/logs', roles(['admin']), systemMonitoringController.getSystemLogs);
router.post('/logs', roles(['admin']), systemMonitoringController.createSystemLog);
router.delete('/logs', roles(['admin']), systemMonitoringController.clearSystemLogs);
router.get('/logs/stats', roles(['admin']), systemMonitoringController.getLogStats);
router.get('/logs/components', roles(['admin']), systemMonitoringController.getLogComponents);

// F.6.2: Security & Fraud Notifications
router.get('/notifications/security', roles(['admin']), systemMonitoringController.getSecurityNotifications);
router.post('/notifications/security', roles(['admin']), systemMonitoringController.createSecurityAlert);

// F.6.3: Blockchain Node Health Monitor
router.get('/blockchain/status', roles(['admin']), systemMonitoringController.getBlockchainStatus);

// Security monitoring
router.get('/security/failed-logins', roles(['admin']), systemMonitoringController.monitorFailedLogins);

// Audit trail
router.get('/audit-trail', roles(['admin']), systemMonitoringController.getAuditTrail);

module.exports = router;
