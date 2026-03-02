const express = require("express");
const router = express.Router();
const { search, suggestions } = require("../controllers/searchController");

router.get("/search", search);
router.get("/search/suggestions", suggestions);

module.exports = router;
