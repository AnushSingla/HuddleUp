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
const { verifyToken, requireAdmin } = require("../middleware/auth");
const { videoValidator } = require("../middleware/validation");
const { upload, validateUploadedFile, cleanupOnError, getUploadLimits } = require("../middleware/multer");
const { advancedFileSecurityValidator, logSecurityAnalysis } = require("../middleware/fileSecurityValidator");
const { videoUploadLimiter } = require("../middleware/rateLimit");
const { uploadLimiter } = require("../middleware/rateLimiter");

// Get upload requirements and limits
router.get("/upload/limits", verifyToken, (req, res) => {
    try {
        const limits = getUploadLimits(req);
        res.json({
            message: "Upload limits retrieved successfully",
            limits
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving upload limits",
            error: error.message
        });
    }
});

// Enhanced video upload with comprehensive validation
router.post("/video/upload", 
  verifyToken, 
  uploadLimiter,
  videoUploadLimiter, 
  upload.single("video"), 
  cleanupOnError,
  validateUploadedFile,
  advancedFileSecurityValidator,
  logSecurityAnalysis,
  videoValidator, 
  createVideo
);

router.get("/videos", getAllVideos);
router.get("/videos/:id/status", getProcessingStatus);
router.put("/videos/:id", verifyToken, videoValidator, updateVideo);
router.delete("/videos/:id", verifyToken, deleteVideo);

// Duplicate detection endpoints (admin only)
router.get("/duplicates/stats", verifyToken, requireAdmin, getDuplicateStats);
router.get("/duplicates/groups", verifyToken, requireAdmin, getDuplicateGroups);

module.exports = router