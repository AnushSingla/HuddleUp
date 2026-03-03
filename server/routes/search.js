const express = require("express");
const router = express.Router();
const { search, suggestions, trending, history } = require("../controllers/searchController");
const { protect } = require("../middleware/auth");

router.get("/search", search);
router.get("/search/suggestions", suggestions);
router.get("/search/trending", trending);
router.get("/search/history", protect, history);

module.exports = router;
