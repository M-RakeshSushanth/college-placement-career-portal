const Notification = require('./Notification.model');
const { emitToRole, broadcastEvent } = require('../../config/socket');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [
        { recipient: req.user.id },
        { recipientRole: req.user.role },
        { recipientRole: 'all' },
      ]
    }).sort({ createdAt: -1 }).limit(30);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        $or: [
          { recipient: req.user.id },
          { recipientRole: req.user.role },
        ]
      },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const broadcastAnnouncement = async (req, res) => {
  try {
    const { title, message, targetRole } = req.body;
    const notif = await Notification.create({
      recipient: null,
      recipientRole: targetRole || 'all',
      title,
      message,
      type: 'system_announcement',
      link: '',
    });

    if (targetRole && targetRole !== 'all') {
      emitToRole(targetRole, 'notification:new', notif);
    } else {
      broadcastEvent('notification:new', notif);
    }

    res.status(201).json({ success: true, message: 'Announcement broadcasted successfully', notif });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  broadcastAnnouncement,
};
