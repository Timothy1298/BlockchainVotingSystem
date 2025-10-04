const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);
// Get audit logs (paginated)
router.get('/', requireRole(['admin']), async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const logs = await AuditLog.find().sort({ createdAt: -1 }).skip((page-1)*limit).limit(Number(limit));
  res.json(logs);
});

// Add audit log (internal use)
router.post('/', async (req, res) => {
  const log = new AuditLog(req.body);
  await log.save();
  res.status(201).json(log);
});

module.exports = router;
