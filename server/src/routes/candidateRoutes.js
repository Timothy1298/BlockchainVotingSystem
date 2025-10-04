const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { mandatory } = require('../middleware/auth');  // ✅ destructure properly

router.use(mandatory);  // ✅ now this is a function

// Candidate management
router.post('/:electionId', candidateController.addCandidate);
router.put('/:electionId/:candidateId', candidateController.editCandidate);
router.delete('/:electionId/:candidateId', candidateController.removeCandidate);
router.post('/:electionId/:candidateId/documents', candidateController.uploadDocument);
router.get('/:candidateId/documents', candidateController.listDocuments);

module.exports = router;
