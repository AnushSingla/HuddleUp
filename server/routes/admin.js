const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/auth");
const { verifyAdmin } = require("../middleware/adminAuth");

// Check admin status (any authenticated user can check)
router.get("/check-admin", verifyToken, adminController.checkAdminStatus);

// Admin-only routes
router.get("/stats", verifyToken, verifyAdmin, adminController.getAdminStats);

// Get flagged content
router.get("/flagged/posts", verifyToken, verifyAdmin, adminController.getFlaggedPosts);
router.get("/flagged/videos", verifyToken, verifyAdmin, adminController.getFlaggedVideos);
router.get("/flagged/comments", verifyToken, verifyAdmin, adminController.getFlaggedComments);

// Flag content (available to all users)
router.post("/flag/post", verifyToken, adminController.flagPost);
router.post("/flag/video", verifyToken, adminController.flagVideo);
router.post("/flag/comment", verifyToken, adminController.flagComment);

// Delete content (admin only)
router.delete(
    "/posts/:postId",
    verifyToken,
    verifyAdmin,
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
    verifyAdmin,
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
    verifyAdmin,
    (req, res, next) => {
        // Maintain backward compatibility: ensure req.params.id is set
        if (!req.params.id && req.params.commentId) {
            req.params.id = req.params.commentId;
        }
        return adminController.deleteComment(req, res, next);
    }
);

// Dismiss flag (admin only)
router.post("/dismiss-flag", verifyToken, verifyAdmin, adminController.dismissFlag);

// Soft delete management (admin only)
router.get("/deleted", verifyToken, verifyAdmin, adminController.getDeletedContent);
router.post("/restore/:type/:id", verifyToken, verifyAdmin, adminController.restoreContent);
router.delete("/permanent/:type/:id", verifyToken, verifyAdmin, adminController.permanentlyDeleteContent);
router.post("/bulk-restore", verifyToken, verifyAdmin, adminController.bulkRestoreContent);
router.post("/cleanup", verifyToken, verifyAdmin, adminController.cleanupDeletedContent);

// User Management (admin only)
router.get("/users", verifyToken, verifyAdmin, adminController.getUsers);
router.post("/users/:id/ban", verifyToken, verifyAdmin, adminController.banUser);
router.post("/users/:id/unban", verifyToken, verifyAdmin, adminController.unbanUser);
router.post("/users/:id/warn", verifyToken, verifyAdmin, adminController.warnUser);

// Audit trail endpoints
router.get("/audit", verifyToken, verifyAdmin, adminController.getAuditTrail);
router.post("/audit/export", verifyToken, verifyAdmin, adminController.exportAuditTrail);
router.get("/audit/stats", verifyToken, verifyAdmin, adminController.getAuditStats);

// Cleanup management endpoints
router.post("/cleanup/trigger", verifyToken, verifyAdmin, adminController.triggerCleanup);
router.get("/cleanup/stats", verifyToken, verifyAdmin, adminController.getCleanupStats);
router.put("/cleanup/retention", verifyToken, verifyAdmin, adminController.updateRetentionPeriod);

module.exports = router;
