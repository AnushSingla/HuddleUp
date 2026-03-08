const express = require("express");
const router = express.Router();
const moderationController = require("../controllers/moderationController");
const { verifyToken, requireModerator } = require("../middleware/auth");

// ─── Report endpoints (any authenticated user can submit) ────────────────────

router.post("/report", verifyToken, moderationController.createReport);

// ─── Moderation Queue (admin/moderator only) ─────────────────────────────────

router.get("/queue", verifyToken, requireModerator, moderationController.getReportQueue);
router.get("/report/:id", verifyToken, requireModerator, moderationController.getReportById);
router.put("/report/:id/resolve", verifyToken, requireModerator, moderationController.resolveReport);
router.get("/user/:userId/reports", verifyToken, requireModerator, moderationController.getUserReports);

// ─── Moderation Logs (admin/moderator only) ──────────────────────────────────

router.get("/logs", verifyToken, requireModerator, moderationController.getModerationLogs);

// ─── Moderation Stats ────────────────────────────────────────────────────────

router.get("/stats", verifyToken, requireModerator, moderationController.getModerationStats);

// ─── Appeals ─────────────────────────────────────────────────────────────────

router.post("/appeal", verifyToken, moderationController.submitAppeal);
router.get("/appeals", verifyToken, requireModerator, moderationController.getAppeals);
router.put("/appeal/:id/resolve", verifyToken, requireModerator, moderationController.resolveAppeal);

module.exports = router;
