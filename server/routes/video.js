const express = require("express");
const router = express.Router();
const { 
  createVideo, 
  getAllVideos, 
  deleteVideo, 
  updateVideo,
  getProcessingStatus,
  getDuplicateStats,
  getDuplicateGroups
} = require("../controllers/videoController");
const { verifyToken } = require("../middleware/auth");
const { videoValidator } = require("../middleware/validation");
const upload = require("../middleware/multer");
const { videoUploadLimiter } = require("../middleware/rateLimit");

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

router.post("/video/upload", verifyToken, videoUploadLimiter, upload.single("video"), videoValidator, createVideo);
router.get("/videos", getAllVideos);
router.get("/videos/:id/status", getProcessingStatus);
router.put("/videos/:id", verifyToken, videoValidator, updateVideo);
router.delete("/videos/:id", verifyToken, deleteVideo);

// Duplicate detection endpoints (admin only)
router.get("/duplicates/stats", verifyToken, isAdmin, getDuplicateStats);
router.get("/duplicates/groups", verifyToken, isAdmin, getDuplicateGroups);

module.exports = router