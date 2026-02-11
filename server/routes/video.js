const express = require("express");
const router = express.Router();
const { createVideo, getAllVideos, deleteVideo, updateVideo } = require("../controllers/videoController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/multer"); // required to handle video uploads

// Create & read videos
router.post("/video/upload", verifyToken, upload.single("video"), createVideo);
router.get("/videos", getAllVideos);

// Update & delete (owner only)
router.put("/videos/:id", verifyToken, updateVideo);
router.delete("/videos/:id", verifyToken, deleteVideo);

module.exports = router