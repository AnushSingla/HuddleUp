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

module.exports = router;
