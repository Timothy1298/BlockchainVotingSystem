
const express = require("express");
const router = express.Router();
const { getCandidates, vote, addCandidate, hasVoted } = require("../controllers/voteController");
const { mandatory } = require("../middleware/auth");

router.use(mandatory);
router.get("/hasVoted", hasVoted);
router.get("/candidates", getCandidates);
router.post("/vote", vote);
router.post("/candidates", addCandidate);

module.exports = router;
