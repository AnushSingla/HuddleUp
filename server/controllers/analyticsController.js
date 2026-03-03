const Video = require("../models/Video");
const User = require("../models/User");
const ViewLog = require("../models/ViewLog");
const VideoAnalytics = require("../models/VideoAnalytics");
const UserAnalytics = require("../models/UserAnalytics");

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Detect device type from User-Agent string – no raw data stored. */
function detectDevice(ua = "") {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/.test(s)) return "tablet";
  if (/mobile|android|iphone|ipod|blackberry|windows phone/.test(s)) return "mobile";
  return "desktop";
}

/** Detect traffic source from Referer header. */
function detectSource(referer = "") {
  if (!referer) return "direct";
  if (/google|bing|yahoo|duckduckgo|search/i.test(referer)) return "search";
  const appDomains = ["huddleup", "localhost", "127.0.0.1"];
  if (appDomains.some((d) => referer.includes(d))) return "recommendations";
  return "external";
}

/** Upsert a VideoAnalytics document and ensure it exists. */
async function ensureVideoAnalytics(videoId) {
  let doc = await VideoAnalytics.findOne({ video: videoId });
  if (!doc) {
    doc = await VideoAnalytics.create({ video: videoId });
  }
  return doc;
}

/** Upsert a UserAnalytics document and ensure it exists. */
async function ensureUserAnalytics(userId) {
  let doc = await UserAnalytics.findOne({ user: userId });
  if (!doc) {
    doc = await UserAnalytics.create({ user: userId });
  }
  return doc;
}

// ─────────────────────────────────────────────
// Event Tracking  (called from other controllers)
// ─────────────────────────────────────────────

/**
 * Track a video view.
 * Call this from the video routes after serving the video.
 */
exports.trackView = async (videoId, req) => {
  try {
    const device = detectDevice(req.headers["user-agent"]);
    const source = detectSource(req.headers["referer"] || req.headers["referrer"]);
    const hourOfDay = new Date().getUTCHours(); // UTC to stay consistent regardless of server timezone
    // Populate country from trusted proxy headers (Cloudflare or Vercel), otherwise "Unknown"
    const country = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || "Unknown";

    // Write view log (lightweight, no PII stored)
    await ViewLog.create({
      video: videoId,
      user: req.user?._id || req.user?.id || null,
      device,
      source,
      hourOfDay,
      country,
      timestamp: new Date(),
    });

    // Increment running totals (async, fire-and-forget)
    VideoAnalytics.findOneAndUpdate(
      { video: videoId },
      {
        $inc: {
          totalViews: 1,
          [`demographics.byDevice.${device}`]: 1,
          [`traffic.${source}`]: 1,
        },
        $set: { lastUpdated: new Date() },
      },
      { upsert: true, new: true }
    ).catch(() => {});
  } catch (err) {
    console.error("trackView error:", err.message);
  }
};

/**
 * Track a like event.
 * increment=true means liked, false means unliked.
 */
exports.trackLike = async (videoId, userId, increment = true) => {
  try {
    const delta = increment ? 1 : -1;
    await VideoAnalytics.findOneAndUpdate(
      { video: videoId },
      { $inc: { totalLikes: delta }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("trackLike error:", err.message);
  }
};

/**
 * Track a comment event.
 */
exports.trackComment = async (videoId) => {
  try {
    await VideoAnalytics.findOneAndUpdate(
      { video: videoId },
      { $inc: { totalComments: 1 }, $set: { lastUpdated: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    console.error("trackComment error:", err.message);
  }
};

// ─────────────────────────────────────────────
// API Endpoints
// ─────────────────────────────────────────────

/**
 * GET /api/analytics/overview
 * Creator-level summary of all their videos.
 */
exports.getOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all videos for this creator
    const videos = await Video.find({ postedBy: userId }).select("_id title likes views createdAt").lean();
    if (!videos.length) {
      return res.json({
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        avgEngagementRate: 0,
        watchTimeMinutes: 0,
        videoCount: 0,
        topVideo: null,
        newFollowers: 0,
      });
    }

    const videoIds = videos.map((v) => v._id);

    // Aggregate analytics docs
    const analyticsAgg = await VideoAnalytics.aggregate([
      { $match: { video: { $in: videoIds } } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$totalViews" },
          totalLikes: { $sum: "$totalLikes" },
          totalComments: { $sum: "$totalComments" },
          totalShares: { $sum: "$totalShares" },
          totalWatchSecs: { $sum: "$watchTime.total" },
        },
      },
    ]);

    const agg = analyticsAgg[0] || {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      totalShares: 0,
      totalWatchSecs: 0,
    };

    // Fallback: use Video.views + Video.likes arrays if analytics docs are sparse
    const fallbackViews = videos.reduce((s, v) => s + (v.views || 0), 0);
    const fallbackLikes = videos.reduce((s, v) => s + (v.likes?.length || 0), 0);

    const totalViews = agg.totalViews || fallbackViews;
    const totalLikes = agg.totalLikes || fallbackLikes;
    const totalComments = agg.totalComments;
    const totalShares = agg.totalShares;

    const engagementRate =
      totalViews > 0
        ? ((totalLikes + totalComments + totalShares) / totalViews) * 100
        : 0;

    // Top video by views
    const topAnalytics = await VideoAnalytics.findOne({ video: { $in: videoIds } })
      .sort({ totalViews: -1 })
      .populate("video", "title createdAt views")
      .lean();

    let topVideo = null;
    if (topAnalytics?.video) {
      topVideo = {
        title: topAnalytics.video.title,
        views: topAnalytics.totalViews || topAnalytics.video.views || 0,
        date: topAnalytics.video.createdAt,
      };
    } else {
      // fallback to highest Video.views
      const sorted = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0));
      if (sorted[0]) {
        topVideo = {
          title: sorted[0].title,
          views: sorted[0].views || 0,
          date: sorted[0].createdAt,
        };
      }
    }

    // Followers = friends count (platform uses friends model)
    const user = await User.findById(userId).select("friends").lean();
    const newFollowers = user?.friends?.length || 0;

    res.json({
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgEngagementRate: parseFloat(engagementRate.toFixed(2)),
      watchTimeMinutes: Math.round((agg.totalWatchSecs || 0) / 60),
      videoCount: videos.length,
      topVideo,
      newFollowers,
    });
  } catch (err) {
    console.error("getOverview error:", err);
    res.status(500).json({ message: "Error fetching analytics overview", error: err.message });
  }
};

/**
 * GET /api/analytics/videos
 * List all creator videos with basic per-video metrics.
 */
exports.getVideoList = async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await Video.find({ postedBy: userId })
      .select("_id title views likes createdAt category")
      .lean();

    if (!videos.length) return res.json([]);

    const videoIds = videos.map((v) => v._id);
    const analyticsDocs = await VideoAnalytics.find({ video: { $in: videoIds } }).lean();
    const analyticsMap = {};
    analyticsDocs.forEach((a) => {
      analyticsMap[a.video.toString()] = a;
    });

    const result = videos.map((v) => {
      const a = analyticsMap[v._id.toString()] || {};
      const totalViews = a.totalViews || v.views || 0;
      const totalLikes = a.totalLikes || v.likes?.length || 0;
      const totalComments = a.totalComments || 0;
      const totalShares = a.totalShares || 0;
      const engagementRate =
        totalViews > 0
          ? parseFloat(
              (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
            )
          : 0;
      return {
        _id: v._id,
        title: v.title,
        category: v.category,
        createdAt: v.createdAt,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        engagementRate,
        watchTimeMinutes: Math.round((a.watchTime?.total || 0) / 60),
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getVideoList error:", err);
    res.status(500).json({ message: "Error fetching video list", error: err.message });
  }
};

/**
 * GET /api/analytics/videos/:videoId
 * Detailed metrics for a single video.
 */
exports.getVideoAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const video = await Video.findById(videoId).lean();
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const analytics = await VideoAnalytics.findOne({ video: videoId }).lean();
    if (!analytics) {
      return res.json({
        video: { _id: video._id, title: video.title, createdAt: video.createdAt },
        totalViews: video.views || 0,
        totalLikes: video.likes?.length || 0,
        totalComments: 0,
        totalShares: 0,
        engagementRate: 0,
        watchTime: { total: 0, average: 0 },
        traffic: { search: 0, recommendations: 0, direct: 0, external: 0 },
        demographics: {
          byDevice: { mobile: 0, tablet: 0, desktop: 0 },
          byCountry: [],
          byHour: [],
        },
        viewTrend: [],
        likeTrend: [],
      });
    }

    // Build daily trend for the last 30 days from view logs
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const viewLogs = await ViewLog.aggregate([
      { $match: { video: video._id, timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    const totalLikes = analytics.totalLikes || video.likes?.length || 0;
    const totalViews = analytics.totalViews || video.views || 0;
    const totalComments = analytics.totalComments || 0;
    const totalShares = analytics.totalShares || 0;
    const engagementRate =
      totalViews > 0
        ? parseFloat(
            (((totalLikes + totalComments + totalShares) / totalViews) * 100).toFixed(2)
          )
        : 0;

    res.json({
      video: { _id: video._id, title: video.title, createdAt: video.createdAt, category: video.category },
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      engagementRate,
      watchTime: analytics.watchTime || { total: 0, average: 0 },
      traffic: analytics.traffic || { search: 0, recommendations: 0, direct: 0, external: 0 },
      demographics: {
        byDevice: analytics.demographics?.byDevice || { mobile: 0, tablet: 0, desktop: 0 },
        byCountry: analytics.demographics?.byCountry || [],
        byHour: analytics.demographics?.byHour || [],
      },
      viewTrend: viewLogs,
    });
  } catch (err) {
    console.error("getVideoAnalytics error:", err);
    res.status(500).json({ message: "Error fetching video analytics", error: err.message });
  }
};

/**
 * GET /api/analytics/trends?period=7d|30d|90d
 * Returns daily view trend for the creator's videos over the given period.
 * Response shape: { period, views: [{date, views}], likes: [], comments: [] }
 * Note: likes and comments trend aggregation is not yet implemented.
 */
exports.getTrends = async (req, res) => {
  try {
    const userId = req.user.id;
    const period = req.query.period || "30d";

    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const videos = await Video.find({ postedBy: userId }).select("_id").lean();
    const videoIds = videos.map((v) => v._id);

    if (!videoIds.length) return res.json({ period, views: [], likes: [], comments: [] });

    const viewTrend = await ViewLog.aggregate([
      { $match: { video: { $in: videoIds }, timestamp: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", views: "$count", _id: 0 } },
    ]);

    // likes/comments trend aggregation is not yet implemented; keys included for consistent response shape
    res.json({ period, views: viewTrend, likes: [], comments: [] });
  } catch (err) {
    console.error("getTrends error:", err);
    res.status(500).json({ message: "Error fetching trends", error: err.message });
  }
};

/**
 * GET /api/analytics/audience/devices
 * Device breakdown across all creator videos.
 */
exports.getDeviceAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await Video.find({ postedBy: userId }).select("_id").lean();
    const videoIds = videos.map((v) => v._id);

    if (!videoIds.length) return res.json({ mobile: 0, tablet: 0, desktop: 0 });

    const result = await ViewLog.aggregate([
      { $match: { video: { $in: videoIds } } },
      { $group: { _id: "$device", count: { $sum: 1 } } },
    ]);

    const devices = { mobile: 0, tablet: 0, desktop: 0, unknown: 0 };
    result.forEach(({ _id, count }) => {
      devices[_id] = count;
    });

    res.json(devices);
  } catch (err) {
    console.error("getDeviceAnalytics error:", err);
    res.status(500).json({ message: "Error fetching device analytics", error: err.message });
  }
};

/**
 * GET /api/analytics/audience/peakHours
 * Activity distribution by hour (0-23) across all creator videos.
 */
exports.getPeakHours = async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await Video.find({ postedBy: userId }).select("_id").lean();
    const videoIds = videos.map((v) => v._id);

    if (!videoIds.length) return res.json([]);

    const result = await ViewLog.aggregate([
      { $match: { video: { $in: videoIds } } },
      { $group: { _id: "$hourOfDay", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $project: { hour: "$_id", viewers: "$count", _id: 0 } },
    ]);

    // Fill missing hours with 0
    const hourMap = {};
    result.forEach(({ hour, viewers }) => { hourMap[hour] = viewers; });
    const fullDay = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      viewers: hourMap[h] || 0,
    }));

    res.json(fullDay);
  } catch (err) {
    console.error("getPeakHours error:", err);
    res.status(500).json({ message: "Error fetching peak hours", error: err.message });
  }
};

/**
 * GET /api/analytics/audience/geography
 * Top countries watching creator's videos.
 */
exports.getGeography = async (req, res) => {
  try {
    const userId = req.user.id;
    const videos = await Video.find({ postedBy: userId }).select("_id").lean();
    const videoIds = videos.map((v) => v._id);

    if (!videoIds.length) return res.json([]);

    const result = await ViewLog.aggregate([
      { $match: { video: { $in: videoIds } } },
      { $group: { _id: "$country", viewers: { $sum: 1 } } },
      { $sort: { viewers: -1 } },
      { $limit: 20 },
      { $project: { country: "$_id", viewers: 1, _id: 0 } },
    ]);

    res.json(result);
  } catch (err) {
    console.error("getGeography error:", err);
    res.status(500).json({ message: "Error fetching geography analytics", error: err.message });
  }
};

/**
 * GET /api/analytics/traffic-sources/:videoId
 * Traffic source breakdown for a single video.
 */
exports.getTrafficSources = async (req, res) => {
  try {
    const userId = req.user.id;
    const { videoId } = req.params;

    const video = await Video.findById(videoId).lean();
    if (!video) return res.status(404).json({ message: "Video not found" });
    if (video.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    const result = await ViewLog.aggregate([
      { $match: { video: video._id } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]);

    const sources = { search: 0, recommendations: 0, direct: 0, external: 0 };
    result.forEach(({ _id, count }) => { sources[_id] = count; });

    res.json(sources);
  } catch (err) {
    console.error("getTrafficSources error:", err);
    res.status(500).json({ message: "Error fetching traffic sources", error: err.message });
  }
};

/**
 * POST /api/analytics/track-view/:videoId  (public, called by client on video open)
 */
exports.recordView = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    await exports.trackView(videoId, req);

    // Increment Video.views
    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    res.json({ success: true });
  } catch (err) {
    console.error("recordView error:", err);
    res.status(500).json({ message: "Error recording view", error: err.message });
  }
};
