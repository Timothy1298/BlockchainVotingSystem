const express = require("express");
const { getCandidates, vote, addCandidate } = require("../controllers/voteController");
const router = express.Router();

router.get("/candidates", getCandidates);
router.post("/vote", vote);
router.post("/candidates", addCandidate);

module.exports = router;
