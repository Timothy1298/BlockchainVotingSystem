const express = require('express');
const router = express.Router();
const { mandatory } = require('../middleware/auth');
const roles = require('../middleware/roles');
const voterController = require('../controllers/voterController');

router.use(mandatory);

// F.2.1: Voter Registration & Verification
router.post('/register', roles(['admin']), voterController.registerVoter);
router.post('/register-csv', roles(['admin']), voterController.registerVotersCSV);
router.post('/:voterId/approve', roles(['admin']), voterController.approveVoter);
router.post('/:voterId/reject', roles(['admin']), voterController.rejectVoter);
router.post('/:voterId/reset', roles(['admin']), voterController.resetVoterAccess);
router.post('/:voterId/blacklist', roles(['admin']), voterController.blacklistVoter);
router.post('/:voterId/token', roles(['admin']), voterController.generateVoterToken);
router.post('/:voterId/force-logout', roles(['admin']), voterController.forceLogout);

// F.2.3: Voter Lookup & Status
router.get('/search', roles(['admin']), voterController.lookupVoter);
router.get('/:voterId/status', roles(['admin']), voterController.getVoterStatus);
router.get('/pending-verification', roles(['admin']), voterController.getPendingVerification);
router.get('/all', roles(['admin']), voterController.getAllVoters);

// F.2.1: Register Voter for Election
router.post('/:voterId/register-election/:electionId', roles(['admin']), voterController.registerVoterForElection);

// Bulk Operations
router.post('/bulk-management', roles(['admin']), voterController.bulkVoterManagement);

// Basic CRUD
router.get('/', roles(['admin']), voterController.list);
router.put('/:id', roles(['admin']), voterController.update);
router.delete('/:id', roles(['admin']), voterController.remove);

module.exports = router;
