
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { mandatory } = require('../middleware/auth');

router.use(mandatory);
// System & App Settings
router.get('/roles', configController.listRoles);
router.post('/roles', configController.setRole);
router.get('/audit-logs/export', configController.exportAuditLogs);
router.get('/notifications', configController.listNotifications);
router.post('/notification-settings', configController.setNotificationSettings);
router.post('/localization', configController.setLocalization);
router.post('/integration', configController.setIntegration);

router.get('/', configController.getConfig);
// Accept receipts; require auth if you want to restrict to logged-in users (optional)
router.post('/receipt', configController.postTxReceipt);
// Election settings (require auth)
router.post('/election', configController.createElection);
router.put('/election/:id', configController.updateElection);
router.post('/election/:electionId/rules', configController.setRules);
router.post('/election/:electionId/phases', configController.setPhases);
router.post('/election/:electionId/ballot-structure', configController.setBallotStructure);
router.get('/election/:electionId/settings', configController.getElectionSettings);

module.exports = router;
