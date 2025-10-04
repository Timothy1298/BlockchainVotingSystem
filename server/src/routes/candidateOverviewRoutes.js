const express = require('express');
const router = express.Router();
const Candidate = require('../models/CandidateDocument');
const { mandatory } = require('../middleware/auth');

// GET /api/candidates/overview

// Return an array of candidates for frontend compatibility
router.get('/', mandatory, async (req, res) => {
  try {
    // If you want to filter by status, you can adjust the query
    const candidates = await Candidate.find({});
    res.json(Array.isArray(candidates) ? candidates : []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
