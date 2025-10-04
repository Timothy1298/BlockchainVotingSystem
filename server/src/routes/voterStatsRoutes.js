const express = require('express');
const router = express.Router();
const Voter = require('../models/Voter');
const { mandatory } = require('../middleware/auth');

// GET /api/voters/stats
router.get('/', mandatory, async (req, res) => {
  try {
    const total = await Voter.countDocuments();
    const registered = await Voter.countDocuments({ status: 'registered' });
    const voted = await Voter.countDocuments({ hasVoted: true });
    res.json({ total, registered, voted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
