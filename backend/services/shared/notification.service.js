const Notification = require('../../models/shared/Notification');
const notiTemplates = require('../../utils/notiTemplates');

/**
 * Creates an in-system notification record in MongoDB
 * @param {Object} data 
 */
async function createNotification(data) {
  try {
    if (!data || !data.title || !data.message) {
      console.warn('[NOTIFICATION WARNING] Incomplete notification payload:', data);
      return null;
    }
    const notification = await Notification.create(data);
    return notification;
  } catch (err) {
    console.error('[NOTIFICATION ERROR] Failed to create in-system notification:', err.message);
    return null;
  }
}

/**
 * Fetches notifications and unread count for current user
 */
async function getNotifications({ userId, role, limit = 25, unreadOnly = false }) {
  const query = {};
  if (role === 'admin') {
    query.recipientRole = 'admin';
  } else {
    query.recipientRole = 'client';
    query.recipient = userId;
  }

  if (unreadOnly) {
    query.isRead = false;
  }

  const [notifications, unreadCount] = await Promise.all([
    Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
    Notification.countDocuments({
      ...(role === 'admin' ? { recipientRole: 'admin' } : { recipientRole: 'client', recipient: userId }),
      isRead: false,
    }),
  ]);

  return { notifications, unreadCount };
}

/**
 * Mark a single notification as read
 */
async function markAsRead(notificationId, { userId, role }) {
  const query = { _id: notificationId };
  if (role === 'admin') {
    query.recipientRole = 'admin';
  } else {
    query.recipientRole = 'client';
    query.recipient = userId;
  }

  const notification = await Notification.findOneAndUpdate(query, { isRead: true }, { new: true });
  return notification;
}

/**
 * Mark all notifications as read for current user
 */
async function markAllAsRead({ userId, role }) {
  const query = {};
  if (role === 'admin') {
    query.recipientRole = 'admin';
  } else {
    query.recipientRole = 'client';
    query.recipient = userId;
  }

  await Notification.updateMany({ ...query, isRead: false }, { isRead: true });
  return { success: true };
}

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  templates: notiTemplates,
};
