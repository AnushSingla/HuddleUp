const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken, requireAdmin } = require("../middleware/auth");

// Check admin status
router.get("/check-admin", verifyToken, adminController.checkAdminStatus);

// Get admin statistics
router.get("/stats", verifyToken, requireAdmin, adminController.getAdminStats);

// Get flagged content
router.get("/flagged/posts", verifyToken, requireAdmin, adminController.getFlaggedPosts);
router.get("/flagged/videos", verifyToken, requireAdmin, adminController.getFlaggedVideos);
router.get("/flagged/comments", verifyToken, requireAdmin, adminController.getFlaggedComments);

// Flag content (available to all users)
router.post("/flag/post", verifyToken, adminController.flagPost);
router.post("/flag/video", verifyToken, adminController.flagVideo);
router.post("/flag/comment", verifyToken, adminController.flagComment);

// Delete content (admin only)
router.delete(
    "/posts/:postId",
    verifyToken,
    requireAdmin,
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
    requireAdmin,
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
    requireAdmin,
    (req, res, next) => {
        // Maintain backward compatibility: ensure req.params.id is set
        if (!req.params.id && req.params.commentId) {
            req.params.id = req.params.commentId;
        }
        return adminController.deleteComment(req, res, next);
    }
);

// Dismiss flag (admin only)
router.post("/dismiss-flag", verifyToken, requireAdmin, adminController.dismissFlag);

// Soft delete management (admin only)
router.get("/deleted", verifyToken, requireAdmin, adminController.getDeletedContent);
router.post("/restore/:type/:id", verifyToken, requireAdmin, adminController.restoreContent);
router.delete("/permanent/:type/:id", verifyToken, requireAdmin, adminController.permanentlyDeleteContent);
router.post("/bulk-restore", verifyToken, requireAdmin, adminController.bulkRestoreContent);
router.post("/cleanup", verifyToken, requireAdmin, adminController.cleanupDeletedContent);

// User Management (admin only)
router.get("/users", verifyToken, requireAdmin, adminController.getUsers);
router.post("/users/:id/ban", verifyToken, requireAdmin, adminController.banUser);
router.post("/users/:id/unban", verifyToken, requireAdmin, adminController.unbanUser);
router.post("/users/:id/warn", verifyToken, requireAdmin, adminController.warnUser);

// Audit trail endpoints
router.get("/audit", verifyToken, requireAdmin, adminController.getAuditTrail);
router.post("/audit/export", verifyToken, requireAdmin, adminController.exportAuditTrail);
router.get("/audit/stats", verifyToken, requireAdmin, adminController.getAuditStats);

// Cleanup management endpoints
router.post("/cleanup/trigger", verifyToken, requireAdmin, adminController.triggerCleanup);
router.get("/cleanup/stats", verifyToken, requireAdmin, adminController.getCleanupStats);

module.exports = router;