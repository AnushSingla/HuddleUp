const express = require("express");
const router = express.Router();
const { createVideo ,getAllVideos,deleteVideo} = require("../controllers/videoController");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/multer"); // required to handle video uploads

router.post("/video/upload", verifyToken, upload.single("video"), createVideo);
router.get("/videos",getAllVideos);
router.delete("/videos/:id", verifyToken, deleteVideo);

module.exports = router