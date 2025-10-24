
const express = require("express");
const router = express.Router();
const { getCandidates, vote, addCandidate, hasVoted, verifyReceipt, getVoteHistory, getAuditTrail } = require("../controllers/voteController");
const { mandatory } = require("../middleware/auth");
const { voteLimiter } = require('../middleware/rateLimiter');
const roles = require('../middleware/roles');

const { body } = require('express-validator');

router.use(mandatory);

// F.4.1: Cast Vote
router.post("/vote",
	voteLimiter,
	[
		body('candidateId').notEmpty().withMessage('candidateId required'),
		body('electionId').notEmpty().withMessage('electionId required')
	],
	vote
);

// F.4.2: Vote Receipt Verification
router.get("/verify/:receiptHash", verifyReceipt);

// Vote status and candidates
router.get("/hasVoted", hasVoted);
router.get("/candidates", getCandidates);

// Voter history and audit trail (auth required)
router.get('/history', getVoteHistory);
router.get('/audit', getAuditTrail);

// Admin only - add candidates
router.post("/candidates", roles(['admin']), addCandidate);

module.exports = router;
