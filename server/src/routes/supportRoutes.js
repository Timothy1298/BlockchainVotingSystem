// server/src/routes/supportRoutes.js
const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { mandatory } = require('../middleware/auth');
const requireAdmin = require('../middleware/roles')(['admin']);

router.use(mandatory);
router.post('/contact', supportController.contactSupport); // Public or admin
router.get('/faq', supportController.getFAQ); // Public
router.get('/system-info', requireAdmin, supportController.systemInfo); // Admin only
router.post('/feedback', supportController.submitFeedback); // Public or admin

module.exports = router;
