const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const { mandatory } = require('../middleware/auth');

if (process.env.SKIP_DB === 'true') {
  return res.json({ total: 0, active: 0, completed: 0 });
}

// GET /api/elections/overview
// routes/elections.js
// Note: Election.status enum values are: 'Setup', 'Open', 'Closed', 'Finalized'
router.get('/overview', mandatory, async (req, res) => {
  try {
  // Map the API-facing groups to possible stored status values.
  // Some existing records use legacy lowercase values ('active','upcoming','completed'),
  // while the current schema uses capitalized enums ('Setup','Open','Closed').
  const activeStatuses = ['Open', 'open', 'active', 'Active'];
  const upcomingStatuses = ['Setup', 'setup', 'upcoming', 'Upcoming'];
  const completedStatuses = ['Closed', 'closed', 'completed', 'Completed'];

  const active = await Election.find({ status: { $in: activeStatuses } });
  const upcoming = await Election.find({ status: { $in: upcomingStatuses } });
  const completed = await Election.find({ status: { $in: completedStatuses } });
    res.json({ active, upcoming, completed });
  } catch (error) {
    console.error('Error fetching election overview:', error.message);
    res.status(500).json({ message: error.message });
  }
});


module.exports = router;
