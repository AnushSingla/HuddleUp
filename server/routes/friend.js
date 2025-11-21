const express = require("express");
const router = express.Router();
const {getAllUsers,sendFriendRequest,getFriendRequests,getSentRequests,acceptFriendRequests, getFriends} = require("../controllers/friendController")
const {verifyToken} = require("../middleware/auth")
router.get("/users",verifyToken,getAllUsers)
router.get("/friends", verifyToken, getFriends);
router.post("/friends/:id",verifyToken,sendFriendRequest)
router.get("/friends/requests",verifyToken,getFriendRequests)
router.get("/friends/sent", verifyToken, getSentRequests);

router.post("/friends/accept/:id",verifyToken,acceptFriendRequests)
module.exports = router