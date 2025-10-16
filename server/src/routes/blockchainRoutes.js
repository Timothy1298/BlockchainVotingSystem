const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);
// Blockchain status
router.get('/status', blockchainController.getStatus);
router.post('/status', requireRole(['admin']), blockchainController.updateStatus);
// Blockchain config
router.get('/config', requireRole(['admin']), blockchainController.getConfig);
router.post('/config', requireRole(['admin']), blockchainController.updateConfig);
// Node management
router.get('/nodes', requireRole(['admin']), blockchainController.listNodes);
router.post('/nodes', requireRole(['admin']), blockchainController.addNode);
router.delete('/nodes/:nodeId', requireRole(['admin']), blockchainController.removeNode);
// Transaction pool
router.get('/tx-pool', requireRole(['admin']), blockchainController.txPool);
// Election preview (map seats -> candidate placeholders or chain IDs)
router.get('/elections/:id/preview', requireRole(['admin']), blockchainController.previewElection);
// Encryption
router.post('/encryption', requireRole(['admin']), blockchainController.setEncryption);
// Fraud detection
router.get('/fraud-alerts', requireRole(['admin']), blockchainController.fraudAlerts);
// Backup/restore
router.post('/backup', requireRole(['admin']), blockchainController.backup);
router.post('/restore', requireRole(['admin']), blockchainController.restore);

module.exports = router;
