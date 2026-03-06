const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const {
  getOverview,
  getVideoList,
  getVideoAnalytics,
  getTrends,
  getDeviceAnalytics,
  getPeakHours,
  getGeography,
  getTrafficSources,
  recordView,
} = require("../controllers/analyticsController");

// Public route – no auth required (anonymous views must be tracked)
router.post("/track-view/:videoId", recordView);

// All routes below require authentication (creator-only)
router.use(verifyToken);

// Overview – creator-level summary
router.get("/overview", getOverview);

// Video list with metrics
router.get("/videos", getVideoList);

// Single video detailed analytics
router.get("/videos/:videoId", getVideoAnalytics);

// Trends over time
router.get("/trends", getTrends);

// Audience analytics
router.get("/audience/devices", getDeviceAnalytics);
router.get("/audience/peakHours", getPeakHours);
router.get("/audience/geography", getGeography);

// Traffic sources for a video
router.get("/traffic-sources/:videoId", getTrafficSources);

module.exports = router;
