const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/auth");

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        const User = require("../models/User");
        const user = await User.findById(req.user.id);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Check admin status
router.get("/check-admin", verifyToken, adminController.checkAdminStatus);

// Get admin statistics
router.get("/stats", verifyToken, isAdmin, adminController.getAdminStats);

// Get flagged content
router.get("/flagged/posts", verifyToken, isAdmin, adminController.getFlaggedPosts);
router.get("/flagged/videos", verifyToken, isAdmin, adminController.getFlaggedVideos);
router.get("/flagged/comments", verifyToken, isAdmin, adminController.getFlaggedComments);

// Flag content (available to all users)
router.post("/flag/post", verifyToken, adminController.flagPost);
router.post("/flag/video", verifyToken, adminController.flagVideo);
router.post("/flag/comment", verifyToken, adminController.flagComment);

// Delete content (admin only)
router.delete(
    "/posts/:postId",
    verifyToken,
    isAdmin,
    (req, res, next) => {
        // Maintain backward compatibility: ensure req.params.id is set
        if (!req.params.id && req.params.postId) {
            req.params.id = req.params.postId;
        }
        return adminController.deletePost(req, res, next);
    }
);
router.delete(
    "/videos/:videoId",
    verifyToken,
    isAdmin,
    (req, res, next) => {
        // Maintain backward compatibility: ensure req.params.id is set
        if (!req.params.id && req.params.videoId) {
            req.params.id = req.params.videoId;
        }
        return adminController.deleteVideo(req, res, next);
    }
);
router.delete(
    "/comments/:commentId",
    verifyToken,
    isAdmin,
    (req, res, next) => {
        // Maintain backward compatibility: ensure req.params.id is set
        if (!req.params.id && req.params.commentId) {
            req.params.id = req.params.commentId;
        }
        return adminController.deleteComment(req, res, next);
    }
);

// Dismiss flag (admin only)
router.post("/dismiss-flag", verifyToken, isAdmin, adminController.dismissFlag);

// Soft delete management (admin only)
router.get("/deleted", verifyToken, isAdmin, adminController.getDeletedContent);
router.post("/restore/:type/:id", verifyToken, isAdmin, adminController.restoreContent);
router.delete("/permanent/:type/:id", verifyToken, isAdmin, adminController.permanentlyDeleteContent);
router.post("/bulk-restore", verifyToken, isAdmin, adminController.bulkRestoreContent);
router.post("/cleanup", verifyToken, isAdmin, adminController.cleanupDeletedContent);

// User Management (admin only)
router.get("/users", verifyToken, isAdmin, adminController.getUsers);
router.post("/users/:id/ban", verifyToken, isAdmin, adminController.banUser);
router.post("/users/:id/unban", verifyToken, isAdmin, adminController.unbanUser);
router.post("/users/:id/warn", verifyToken, isAdmin, adminController.warnUser);

module.exports = router;
// Audit trail endpoints
router.get("/audit", verifyToken, isAdmin, adminController.getAuditTrail);
router.post("/audit/export", verifyToken, isAdmin, adminController.exportAuditTrail);
router.get("/audit/stats", verifyToken, isAdmin, adminController.getAuditStats);

// Cleanup management endpoints
router.post("/cleanup", verifyToken, isAdmin, adminController.triggerCleanup);
router.get("/cleanup/stats", verifyToken, isAdmin, adminController.getCleanupStats);
router.put("/cleanup/retention", verifyToken, isAdmin, adminController.updateRetentionPeriod);