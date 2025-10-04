const express = require('express');
const router = express.Router();
const SystemLog = require('../models/SystemLog');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);
// ✅ Authenticate first, then authorize (admin-only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const logs = await SystemLog.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ logs });
  } catch (err) {
    console.error("Error fetching system logs:", err);
    res.status(500).json({ message: "Failed to fetch system logs." });
  }
});

module.exports = router;
