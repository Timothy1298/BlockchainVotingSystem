const express = require('express');
const router = express.Router();
const { mandatory } = require('../middleware/auth');
const roles = require('../middleware/roles');
const electionController = require('../controllers/electionController');

router.use(mandatory);

// List all elections
router.get('/', electionController.list);

// Create a new election (admin only)
router.post('/', roles(['admin']), electionController.create);

// Dashboard overview endpoint
router.get('/overview', electionController.overview);

// Election-specific routes
router.get('/:id', electionController.get);
router.put('/:id', roles(['admin']), electionController.update);
router.delete('/:id', roles(['admin']), electionController.delete);

// F.1.2: Election Lifecycle Control
router.patch('/:id/status', roles(['admin']), electionController.changeStatus);
router.patch('/:id/voting', roles(['admin']), electionController.toggleVoting);
router.post('/:id/reset', roles(['admin']), electionController.resetElection);
router.post('/:id/clear-votes', roles(['admin']), electionController.clearVotes);

// F.3.1: Candidate Management
router.post('/:id/candidates', roles(['admin']), electionController.addCandidate);
router.get('/:id/candidates', electionController.getCandidatesByElection);
router.put('/:id/candidates/:candidateId', roles(['admin']), electionController.updateCandidate);
router.delete('/:id/candidates/:candidateId', roles(['admin']), electionController.deleteCandidate);
router.post('/:id/candidates/bulk-import', roles(['admin']), electionController.bulkImportCandidates);
router.patch('/:id/candidates/lock', roles(['admin']), electionController.lockCandidateList);

// Voting
router.post('/:id/vote', electionController.vote);

// F.5.1-F.5.3: Results & Tallying
router.post('/:id/finalize', roles(['admin']), electionController.finalizeTally);
router.get('/:id/turnout', electionController.getTurnoutAnalytics);
router.get('/:id/results', electionController.getFinalResults);
router.get('/:id/export', electionController.exportResults);

module.exports = router;
