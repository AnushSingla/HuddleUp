const mongoose = require("mongoose");
const Notification = require("../models/Notification");

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
    res.status(500).json({ message: "Error fetching notifications" });
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
    res.status(500).json({ message: "Error fetching unread count" });
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
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ message: "Notification marked as read", notification });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
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
      return res.status(404).json({ message: "Notification not found" });
    }
    notification.isRead = true;
    await notification.save();
    res.json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notification" });
  }
};

/** POST /api/notifications/mark-all-as-read */
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
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
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting notification" });
  }
};

/** DELETE /api/notifications/clear-all */
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Error clearing notifications" });
  }
};
