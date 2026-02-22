const express = require("express");
const router =  express.Router();
const authController = require("../controllers/authController")
const { register, login, getUserProfile, updateUserProfile, updatePassword, forgotPassword, resetPassword } = require('../controllers/authController');
const { verifyToken } = require("../middleware/auth");
const { registerValidator, loginValidator, profileUpdateValidator, passwordUpdateValidator } = require("../middleware/validation");

router.post("/register", registerValidator, register);
router.post("/login", loginValidator, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, profileUpdateValidator, updateUserProfile);
router.put("/password", verifyToken, passwordUpdateValidator, updatePassword);

module.exports = router;