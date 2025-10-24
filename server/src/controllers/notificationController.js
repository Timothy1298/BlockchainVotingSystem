const Notification = require('../models/Notification');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

// F.6.2: Get all notifications with filtering
exports.list = async (req, res) => {
  try {
    const { 
      type, 
      severity, 
      status, 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // If user is authenticated, filter by user
    if (req.user?.id) {
      filter.$or = [
        { userId: req.user.id },
        { userId: null }, // Global notifications
        { targetRole: req.user.role }
      ];
    }
    
    if (type) filter.type = type;
    if (severity) filter.severity = severity;
    if (status) filter.isRead = status === 'read';
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { message: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const notifications = await Notification.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email')
      .lean();

    const total = await Notification.countDocuments(filter);
    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// F.6.2: Create notification
exports.create = async (req, res) => {
  try {
    const notificationData = {
      ...req.body,
      userId: req.user?.id,
      createdAt: new Date()
    };

    const notification = new Notification(notificationData);
    await notification.save();

    // Log the notification creation
    await AuditLog.create({
      action: 'notification_created',
      userId: req.user?.id,
      details: {
        notificationId: notification._id,
        type: notification.type,
        severity: notification.severity,
        title: notification.title
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
};

// F.6.2: Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read', error: error.message });
  }
};

// F.6.2: Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking all notifications as read', error: error.message });
  }
};

// F.6.2: Delete notification
exports.delete = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Log the notification deletion
    await AuditLog.create({
      action: 'notification_deleted',
      userId: req.user?.id,
      details: {
        notificationId: req.params.id,
        type: notification.type,
        severity: notification.severity,
        title: notification.title
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
};

// F.6.2: Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ isRead: false });
    res.json({ unreadCount: count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching unread count', error: error.message });
  }
};

// F.6.2: Get notifications by type
exports.getByType = async (req, res) => {
  try {
    const { type } = req.params;
    const notifications = await Notification.find({ type })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email')
      .lean();

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications by type', error: error.message });
  }
};

// F.6.2: Get notifications by severity
exports.getBySeverity = async (req, res) => {
  try {
    const { severity } = req.params;
    const notifications = await Notification.find({ severity })
      .sort({ createdAt: -1 })
      .populate('userId', 'fullName email')
      .lean();

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications by severity', error: error.message });
  }
};

// F.6.2: Acknowledge notification
exports.acknowledge = async (req, res) => {
  try {
    const { reason } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        isRead: true, 
        acknowledgedAt: new Date(),
        acknowledgedBy: req.user?.id,
        acknowledgmentReason: reason
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Log the acknowledgment
    await AuditLog.create({
      action: 'notification_acknowledged',
      userId: req.user?.id,
      details: {
        notificationId: req.params.id,
        type: notification.type,
        severity: notification.severity,
        title: notification.title,
        reason
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error acknowledging notification', error: error.message });
  }
};

// F.6.2: Dismiss notification
exports.dismiss = async (req, res) => {
  try {
    const { reason } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { 
        isRead: true, 
        dismissedAt: new Date(),
        dismissedBy: req.user?.id,
        dismissalReason: reason
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Log the dismissal
    await AuditLog.create({
      action: 'notification_dismissed',
      userId: req.user?.id,
      details: {
        notificationId: req.params.id,
        type: notification.type,
        severity: notification.severity,
        title: notification.title,
        reason
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error dismissing notification', error: error.message });
  }
};

// F.6.2: Get notification settings
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const settings = user.notificationSettings || {
      email: {
        security: true,
        operational: true,
        system: false,
        election: true
      },
      sms: {
        security: true,
        operational: false,
        system: false,
        election: false
      },
      push: {
        security: true,
        operational: true,
        system: true,
        election: true
      }
    };

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notification settings', error: error.message });
  }
};

// F.6.2: Update notification settings
exports.updateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { notificationSettings: settings },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log the settings update
    await AuditLog.create({
      action: 'notification_settings_updated',
      userId: req.user?.id,
      details: {
        settings
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ success: true, settings: user.notificationSettings });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification settings', error: error.message });
  }
};

// F.6.2: Create security alert
exports.createSecurityAlert = async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      type: 'security',
      severity: req.body.severity || 'high',
      isRead: false,
      userId: req.user?.id,
      createdAt: new Date()
    };

    const alert = new Notification(alertData);
    await alert.save();

    // Log the security alert creation
    await AuditLog.create({
      action: 'security_alert_created',
      userId: req.user?.id,
      details: {
        alertId: alert._id,
        severity: alert.severity,
        title: alert.title,
        message: alert.message
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error creating security alert', error: error.message });
  }
};

// F.6.2: Create operational alert
exports.createOperationalAlert = async (req, res) => {
  try {
    const alertData = {
      ...req.body,
      type: 'operational',
      severity: req.body.severity || 'medium',
      isRead: false,
      userId: req.user?.id,
      createdAt: new Date()
    };

    const alert = new Notification(alertData);
    await alert.save();

    // Log the operational alert creation
    await AuditLog.create({
      action: 'operational_alert_created',
      userId: req.user?.id,
      details: {
        alertId: alert._id,
        severity: alert.severity,
        title: alert.title,
        message: alert.message
      },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ message: 'Error creating operational alert', error: error.message });
  }
};
