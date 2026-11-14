const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // null indicates broadcast/role-wide
  },
  recipientRole: {
    type: String,
    enum: ['student', 'recruiter', 'admin', 'all'],
    default: 'student',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['job_posted', 'application_status', 'interview_scheduled', 'system_announcement', 'shortlist_alert', 'general'],
    default: 'general',
  },
  link: {
    type: String,
    default: '',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
