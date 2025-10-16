
const express = require("express");
const router = express.Router();
const { getCandidates, vote, addCandidate, hasVoted } = require("../controllers/voteController");
const { mandatory } = require("../middleware/auth");
const { createLimiter } = require('../middleware/rateLimiter');

const voteLimiter = createLimiter({ windowMs: 60 * 1000, max: 5, message: 'Too many votes from this source, slow down.' });
const { body } = require('express-validator');

router.use(mandatory);
router.get("/hasVoted", hasVoted);
router.get("/candidates", getCandidates);
router.post("/vote",
	voteLimiter,
	[
		body('candidateId').notEmpty().withMessage('candidateId required'),
		body('electionId').notEmpty().withMessage('electionId required')
	],
	vote
);
router.post("/candidates", addCandidate);

module.exports = router;
