const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);
// Blockchain status
router.get('/status', blockchainController.getStatus);
router.post('/status', requireRole(['admin']), blockchainController.updateStatus);
// Blockchain metrics
router.get('/metrics', blockchainController.getMetrics);
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

// F.6.3: Blockchain Health Monitor
router.get('/health', blockchainController.checkBlockchainHealth);
router.get('/nodes/status', blockchainController.getNodeStatus);
router.get('/nodes/status/:nodeId', blockchainController.getNodeStatus);
router.get('/network-config', blockchainController.getNetworkConfiguration);
router.get('/gas-tracker', blockchainController.getGasTracker);
router.get('/block-explorer', blockchainController.getBlockExplorer);

module.exports = router;
