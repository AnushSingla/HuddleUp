const express = require("express");
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAsReadLegacy,
  markAllAsRead,
  deleteNotification,
  clearAll,
} = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.post("/mark-as-read/:notificationId", verifyToken, markAsRead);
router.put("/:id", verifyToken, markAsReadLegacy);
router.post("/mark-all-as-read", verifyToken, markAllAsRead);
router.delete("/clear-all", verifyToken, clearAll);
router.delete("/:notificationId", verifyToken, deleteNotification);

module.exports = router;
