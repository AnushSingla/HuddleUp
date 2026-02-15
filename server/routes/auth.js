const express = require("express");
const router =  express.Router();
const authController = require("../controllers/authController")
const { register, login, getUserProfile, updateUserProfile, updatePassword } = require('../controllers/authController');
const { verifyToken } = require("../middleware/auth");

router.post("/register",register);
router.post("/login",login);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);
router.put("/password", verifyToken, updatePassword);

module.exports = router;