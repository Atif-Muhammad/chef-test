const notificationService = require('../../services/shared/notification.service');

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const role = req.user.role;
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await notificationService.getNotifications({
      userId,
      role,
      limit,
      unreadOnly,
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    const notification = await notificationService.markAsRead(id, { userId, role });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    return res.json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const role = req.user.role;

    await notificationService.markAllAsRead({ userId, role });
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
