const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'alert', 'warning', 'success'], default: 'info' },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  forAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('Notification', NotificationSchema);
