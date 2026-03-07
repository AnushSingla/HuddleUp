const express = require("express");
const router = express.Router();
const userDeleteController = require("../controllers/userDeleteController");
const { verifyToken } = require("../middleware/auth");

// Get user's deleted content
router.get("/deleted", verifyToken, userDeleteController.getUserDeletedContent);

// Get restoration info for specific content
router.get("/restoration-info/:type/:id", verifyToken, userDeleteController.getRestorationInfo);

// Restore user's own deleted content
router.post("/restore/:type/:id", verifyToken, userDeleteController.restoreUserContent);

// Permanently delete user's own content
router.delete("/permanent/:type/:id", verifyToken, userDeleteController.permanentlyDeleteUserContent);

module.exports = router;