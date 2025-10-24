const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { mandatory } = require('../middleware/auth');
const requireRole = require('../middleware/roles');

router.use(mandatory);

// F.6.2: Get all notifications with filtering
router.get('/', notificationController.list);

// F.6.2: Create notification
router.post('/', requireRole(['admin']), notificationController.create);

// F.6.2: Mark notification as read
router.patch('/:id/read', notificationController.markAsRead);

// F.6.2: Mark all notifications as read
router.patch('/read-all', notificationController.markAllAsRead);

// F.6.2: Get unread count
router.get('/unread-count', notificationController.getUnreadCount);

// F.6.2: Get notifications by type
router.get('/type/:type', notificationController.getByType);

// F.6.2: Get notifications by severity
router.get('/severity/:severity', notificationController.getBySeverity);

// F.6.2: Acknowledge notification
router.patch('/:id/acknowledge', requireRole(['admin']), notificationController.acknowledge);

// F.6.2: Dismiss notification
router.patch('/:id/dismiss', requireRole(['admin']), notificationController.dismiss);

// F.6.2: Delete notification
router.delete('/:id', requireRole(['admin']), notificationController.delete);

// F.6.2: Notification settings
router.get('/settings', notificationController.getSettings);
router.put('/settings', notificationController.updateSettings);

// F.6.2: Create security alert
router.post('/security-alert', requireRole(['admin']), notificationController.createSecurityAlert);

// F.6.2: Create operational alert
router.post('/operational-alert', requireRole(['admin']), notificationController.createOperationalAlert);

module.exports = router;
