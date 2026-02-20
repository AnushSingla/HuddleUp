const express = require("express");
const router = express.Router();
const { getPublicProfile } = require("../controllers/userController");

// Public profile by userId or username (no auth)
router.get("/users/:identifier", getPublicProfile);

module.exports = router;
