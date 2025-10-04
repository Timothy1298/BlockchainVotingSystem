const express = require('express');
const router = express.Router();
const adminProfile = require('../controllers/adminProfileController');
const { mandatory } = require('../middleware/auth');

router.use(mandatory);

// Profile
router.get('/profile', adminProfile.getProfile);
router.put('/profile', adminProfile.updateProfile);
router.post('/change-password', adminProfile.changePassword);

// 2FA
router.get('/2fa', adminProfile.get2FA);
router.post('/2fa/enable', adminProfile.enable2FA);
router.post('/2fa/disable', adminProfile.disable2FA);

// API Keys
router.get('/api-keys', adminProfile.listApiKeys);
router.post('/api-keys', adminProfile.createApiKey);
router.delete('/api-keys/:key', adminProfile.revokeApiKey);

// Sessions
router.get('/sessions', adminProfile.listSessions);
router.delete('/sessions/:sessionId', adminProfile.revokeSession);

module.exports = router;
