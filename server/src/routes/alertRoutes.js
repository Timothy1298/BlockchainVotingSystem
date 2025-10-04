const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { mandatory } = require('../middleware/auth');

// GET /api/alerts
router.get('/', mandatory, async (req, res) => {
  try {
    // Example: fetch latest alerts/notifications
    const alerts = await Notification.find().sort({ createdAt: -1 }).limit(10);
    res.json({ alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
