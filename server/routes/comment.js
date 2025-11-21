const express = require("express");
const router = express.Router();
const {createComment,getAllComments,getAllPostComments, deleteComment,likeVideo, viewVideo, getSingleVideo,toggleLikeComment} = require("../controllers/commentController");
const { verifyToken} = require("../middleware/auth")
router.post("/comments",verifyToken,createComment);
router.get("/comments/:videoId",getAllComments);
router.get("/comments/post/:postId", getAllPostComments);
router.delete("/comments/:commentId", verifyToken, deleteComment);

router.patch("/comments/:id/like", verifyToken, toggleLikeComment);


router.get("/videos/:id", getSingleVideo);
router.post("/videos/:id/like",verifyToken,likeVideo)
router.post("/videos/:id/view",viewVideo)

module.exports = router;