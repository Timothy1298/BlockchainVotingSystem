const express = require('express');
const router = express.Router();
const { mandatory } = require('../middleware/auth');
const roles = require('../middleware/roles');
const voterController = require('../controllers/voterController');

router.use(mandatory);
// Register new voter (manual)
router.post('/register', roles(['admin']), voterController.registerVoter);
// Register new voters (CSV upload)
router.post('/register-csv', roles(['admin']), voterController.registerVotersCSV);
// Approve voter
router.post('/:voterId/approve', roles(['admin']), voterController.approveVoter);
// Reject voter
router.post('/:voterId/reject', roles(['admin']), voterController.rejectVoter);
// Reset voter access
router.post('/:voterId/reset', roles(['admin']), voterController.resetVoterAccess);
// Blacklist voter
router.post('/:voterId/blacklist', roles(['admin']), voterController.blacklistVoter);
// Generate voter access token/QR
router.post('/:voterId/token', roles(['admin']), voterController.generateToken);

router.get('/', roles(['admin']), voterController.list);
router.put('/:id', roles(['admin']), voterController.update);
router.delete('/:id', roles(['admin']), voterController.remove);

module.exports = router;
