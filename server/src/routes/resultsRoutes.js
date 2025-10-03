const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const resultsController = require('../controllers/resultsController');

router.get('/:electionId', auth, resultsController.getResults);

module.exports = router;
