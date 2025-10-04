const express = require('express');
const router = express.Router();
const { mandatory } = require('../middleware/auth');
const resultsController = require('../controllers/resultsController');

router.use(mandatory);
// Prevent /overview from being treated as an electionId
router.get('/:electionId', (req, res, next) => {
	if (req.params.electionId === 'overview') {
		return res.status(404).json({ message: 'Not found' });
	}
	return resultsController.getResults(req, res, next);
});

module.exports = router;
