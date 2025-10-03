const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const electionController = require('../controllers/electionController');

router.get('/', auth, electionController.list);
router.post('/', auth, roles(['admin']), electionController.create);
router.get('/:id', auth, electionController.get);
router.post('/:id/candidates', auth, roles(['admin']), electionController.addCandidate);
router.delete('/:id', auth, roles(['admin']), electionController.delete);
router.put('/:id', auth, roles(['admin']), electionController.update);
router.get('/:id/candidates', auth, electionController.getCandidatesByElection);

module.exports = router;
