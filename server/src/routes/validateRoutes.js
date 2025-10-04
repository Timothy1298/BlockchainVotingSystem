const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditLog');
const { mandatory } = require('../middleware/auth');

router.use(mandatory);
// Validate receipt hash (returns true if found in logs)
router.get('/receipt/:hash', async (req, res) => {
  const { hash } = req.params;
  const found = await AuditLog.findOne({ 'details.receiptHash': hash });
  res.json({ valid: !!found });
});

module.exports = router;
