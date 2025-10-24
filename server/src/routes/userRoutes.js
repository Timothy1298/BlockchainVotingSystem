const express = require('express');
const router = express.Router();
const { mandatory } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.use(mandatory);

// Basic user management
router.get('/', userController.getAllUsers);
router.get('/me', userController.getMe);
router.put('/me', userController.updateMe);

// Profile management
router.put('/me/password', userController.changePassword);
router.get('/me/security', userController.getSecuritySettings);

// 2FA management
router.post('/me/2fa/setup', userController.setup2FA);
router.post('/me/2fa/verify', userController.verify2FA);
router.post('/me/2fa/disable', userController.disable2FA);

// Session management
router.get('/me/sessions', userController.getActiveSessions);
router.post('/me/logout-other-devices', userController.logoutOtherDevices);

// Notification preferences
router.put('/me/notification-preferences', userController.updateNotificationPreferences);

module.exports = router;
