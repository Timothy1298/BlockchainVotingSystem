const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['security', 'fraud', 'system', 'election', 'voter'], 
    required: true 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  isRead: { type: Boolean, default: false },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
  readAt: { type: Date },
  acknowledgedAt: { type: Date },
  acknowledgedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  acknowledgmentReason: { type: String },
  dismissedAt: { type: Date },
  dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  dismissalReason: { type: String }
});

module.exports = mongoose.model('Notification', NotificationSchema);