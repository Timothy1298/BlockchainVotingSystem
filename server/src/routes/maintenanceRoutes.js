// server/src/routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { mandatory } = require('../middleware/auth');
const requireAdmin = require('../middleware/roles')(['admin']);

router.use(mandatory);
router.post('/backup', requireAdmin, maintenanceController.backupDatabase);
router.post('/restore', requireAdmin, maintenanceController.restoreDatabase);
router.post('/clear-cache', requireAdmin, maintenanceController.clearCache);
router.get('/diagnostics', requireAdmin, maintenanceController.systemDiagnostics);
router.post('/reset-blockchain', requireAdmin, maintenanceController.resetBlockchain);
router.get('/backups', requireAdmin, maintenanceController.listBackups);

module.exports = router;
