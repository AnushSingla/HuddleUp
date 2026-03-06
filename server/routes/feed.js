const express = require("express");
const router = express.Router();
const { getFeed } = require("../controllers/feedController");
const { feedLimiter } = require("../middleware/rateLimit");

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        req.user = null;
        return next();
    }
    const jwt = require("jsonwebtoken");
    const token = authHeader.split(" ")[1];
    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        req.user = null;
    }
    next();
};

router.get("/:type", feedLimiter, optionalAuth, getFeed);

module.exports = router;
