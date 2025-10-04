const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);
// Get all notifications (admin), or last 5 (user)
router.get('/', async (req, res) => {
  const { admin } = req.query;
  if (admin === 'true') {
    const all = await Notification.find().sort({ createdAt: -1 });
    return res.json(all);
  }
  const last5 = await Notification.find().sort({ createdAt: -1 }).limit(5);
  res.json(last5);
});

// Create notification (admin)
router.post('/', requireRole(['admin']), async (req, res) => {
  const n = new Notification(req.body);
  await n.save();
  res.status(201).json(n);
});

// Delete notification (admin)
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
