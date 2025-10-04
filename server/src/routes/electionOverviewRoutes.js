const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const { mandatory } = require('../middleware/auth');

if (process.env.SKIP_DB === 'true') {
  return res.json({ total: 0, active: 0, completed: 0 });
}

// GET /api/elections/overview
// routes/elections.js
router.get('/overview', mandatory, async (req, res) => {
  try {
    const active = await Election.find({ status: 'active' });
    const upcoming = await Election.find({ status: 'upcoming' });
    const completed = await Election.find({ status: 'completed' });
    res.json({ active, upcoming, completed });
  } catch (error) {
    console.error('Error fetching election overview:', error.message);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
