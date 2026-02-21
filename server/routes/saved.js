const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const { getSaved, addVideo, removeVideo, addPost, removePost } = require("../controllers/savedController");

router.use(verifyToken);

router.get("/saved", getSaved);
router.post("/saved/video/:videoId", addVideo);
router.delete("/saved/video/:videoId", removeVideo);
router.post("/saved/post/:postId", addPost);
router.delete("/saved/post/:postId", removePost);

module.exports = router;
