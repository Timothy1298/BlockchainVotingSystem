const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const { mandatory } = require('../middleware/auth');

// GET /api/results/overview
router.get('/', mandatory, async (req, res) => {
  try {
    const results = await Election.find({}, { title: 1, status: 1, results: 1 }).sort({ updatedAt: -1 }).limit(10);
    res.json({ results });
  } catch (error) {
    console.error('Error fetching results overview:', error.message);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
