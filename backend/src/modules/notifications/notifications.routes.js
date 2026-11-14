const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/', verifyToken, notificationsController.getMyNotifications);
router.put('/:id/read', verifyToken, notificationsController.markAsRead);
router.put('/mark-all/read', verifyToken, notificationsController.markAllAsRead);
router.post('/broadcast', verifyToken, authorizeRoles('admin'), notificationsController.broadcastAnnouncement);

module.exports = router;
