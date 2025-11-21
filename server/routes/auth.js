const express = require("express");
const router =  express.Router();
const authController = require("../controllers/authController")
const { register, login } = require('../controllers/authController');


router.post("/register",register);
router.post("/login",login);

module.exports = router;