const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null indicates all admins or broadcast
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'client'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    previewDate: {
      type: String,
      default: '',
      trim: true,
    },
    previewTime: {
      type: String,
      default: '',
      trim: true,
    },
    link: {
      type: String,
      default: '',
      trim: true,
    },
    data: {
      visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit' },
      clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      metadata: { type: mongoose.Schema.Types.Mixed },
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user notifications quickly
NotificationSchema.index({ recipientRole: 1, recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
