const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

/** GET /api/notifications?limit=10&skip=0 - Fetch user's notifications (paginated) */
exports.getNotifications = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = parseInt(req.query.skip, 10) || 0;
    const recipientId = mongoose.Types.ObjectId.isValid(req.user.id) ? new mongoose.Types.ObjectId(req.user.id) : req.user.id;

    const notifications = await Notification.find({
      recipient: recipientId,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: { $exists: false } },
        { expiresAt: null },
      ],
    })
      .populate("sender", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json(notifications);
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error fetching notifications");
  }
};

/** GET /api/notifications/unread-count */
exports.getUnreadCount = async (req, res) => {
  try {
    const recipientId = mongoose.Types.ObjectId.isValid(req.user.id) ? new mongoose.Types.ObjectId(req.user.id) : req.user.id;
    const count = await Notification.countDocuments({
      recipient: recipientId,
      isRead: false,
      $or: [
        { expiresAt: { $gt: new Date() } },
        { expiresAt: { $exists: false } },
        { expiresAt: null },
      ],
    });
    res.json({ unreadCount: count });
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error fetching unread count");
  }
};

/** POST /api/notifications/mark-as-read/:notificationId */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: req.user.id,
    });
    if (!notification) {
      return ResponseHandler.notFound(res, "Notification");
    }
    notification.isRead = true;
    await notification.save();
    return ResponseHandler.success(res, { notification }, "Notification marked as read");
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error updating notification");
  }
};

/** PUT /api/notifications/:id - legacy single mark-as-read (keep for backward compat) */
exports.markAsReadLegacy = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
    });
    if (!notification) {
      return ResponseHandler.notFound(res, "Notification");
    }
    notification.isRead = true;
    await notification.save();
    return ResponseHandler.success(res, null, "Notification marked as read");
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error updating notification");
  }
};

/** POST /api/notifications/mark-all-as-read */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    return ResponseHandler.success(res, null, "All notifications marked as read");
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error updating notifications");
  }
};

/** DELETE /api/notifications/:notificationId */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const deleted = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: req.user.id,
    });
    if (!deleted) {
      return ResponseHandler.notFound(res, "Notification");
    }
    return ResponseHandler.success(res, null, "Notification deleted successfully");
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error deleting notification");
  }
};

/** DELETE /api/notifications/clear-all */
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    return ResponseHandler.success(res, null, "All notifications cleared successfully");
  } catch (error) {
    return ResponseHandler.handleError(error, req, res, "Error clearing notifications");
  }
};
