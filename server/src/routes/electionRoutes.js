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
router.get('/overview', electionController.overview); // <-- make sure this method exists in electionController

// Election-specific routes
router.get('/:id', electionController.get);
router.post('/:id/candidates', roles(['admin']), electionController.addCandidate);
router.delete('/:id', roles(['admin']), electionController.delete);
router.put('/:id', roles(['admin']), electionController.update);
router.get('/:id/candidates', electionController.getCandidatesByElection);

module.exports = router;
