const express = require('express');
const router = express.Router();
const notificationController = require('../../controllers/shared/notification.controller');
const { requireAuth, checkClientActive } = require('../../middleware/auth.middleware');

router.use(requireAuth);
router.use(checkClientActive);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;
