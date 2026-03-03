const express = require("express");
const router = express.Router();
const moderationController = require("../controllers/moderationController");
const { verifyToken } = require("../middleware/auth");

// Middleware to check if user is admin or moderator
const isModeratorOrAdmin = async (req, res, next) => {
    try {
        const User = require("../models/User");
        const user = await User.findById(req.user.id);

        if (!user || (!user.isAdmin && user.role !== 'admin' && user.role !== 'moderator')) {
            return res.status(403).json({ message: "Access denied. Moderator or Admin only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// ─── Report endpoints (any authenticated user can submit) ────────────────────

router.post("/report", verifyToken, moderationController.createReport);

// ─── Moderation Queue (admin/moderator only) ─────────────────────────────────

router.get("/queue", verifyToken, isModeratorOrAdmin, moderationController.getReportQueue);
router.get("/report/:id", verifyToken, isModeratorOrAdmin, moderationController.getReportById);
router.put("/report/:id/resolve", verifyToken, isModeratorOrAdmin, moderationController.resolveReport);
router.get("/user/:userId/reports", verifyToken, isModeratorOrAdmin, moderationController.getUserReports);

// ─── Moderation Logs (admin/moderator only) ──────────────────────────────────

router.get("/logs", verifyToken, isModeratorOrAdmin, moderationController.getModerationLogs);

// ─── Moderation Stats ────────────────────────────────────────────────────────

router.get("/stats", verifyToken, isModeratorOrAdmin, moderationController.getModerationStats);

// ─── Appeals ─────────────────────────────────────────────────────────────────

router.post("/appeal", verifyToken, moderationController.submitAppeal);
router.get("/appeals", verifyToken, isModeratorOrAdmin, moderationController.getAppeals);
router.put("/appeal/:id/resolve", verifyToken, isModeratorOrAdmin, moderationController.resolveAppeal);

module.exports = router;
