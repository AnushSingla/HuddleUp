/**
 * Analytics API – Integration Tests
 * Run with: npm test
 */

// Set JWT secret BEFORE any modules are required
process.env.JWT_SECRET = 'test-jwt-secret';
const TEST_SECRET = 'test-jwt-secret';
const express = require("express");
const mongoose = require("mongoose");

// ─── App setup (minimal, mirrors server.js) ───────────────────────────────────
const analyticsRoutes = require("../routes/analytics");
const { verifyToken } = require("../middleware/auth");
const jwt = require("jsonwebtoken");

const request = require("supertest");

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/analytics", analyticsRoutes);
  return app;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeToken(userId) {
  return jwt.sign({ id: userId, _id: userId }, process.env.JWT_SECRET || TEST_SECRET, {
    expiresIn: "1h",
  });
}

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("../models/Video");
jest.mock("../models/User");
jest.mock("../models/ViewLog");
jest.mock("../models/VideoAnalytics");
jest.mock("../models/UserAnalytics");
jest.mock("../models/Comment");

const Video = require("../models/Video");
const User = require("../models/User");
const ViewLog = require("../models/ViewLog");
const VideoAnalytics = require("../models/VideoAnalytics");

const FAKE_USER_ID = new mongoose.Types.ObjectId().toString();
const FAKE_VIDEO_ID = new mongoose.Types.ObjectId().toString();

const fakeVideo = {
  _id: new mongoose.Types.ObjectId(FAKE_VIDEO_ID),
  title: "Test Video",
  category: "Sports",
  views: 42,
  likes: [],
  postedBy: new mongoose.Types.ObjectId(FAKE_USER_ID),
  createdAt: new Date(),
};

const fakeAnalytics = {
  _id: new mongoose.Types.ObjectId(),
  video: new mongoose.Types.ObjectId(FAKE_VIDEO_ID),
  totalViews: 100,
  totalLikes: 20,
  totalComments: 5,
  totalShares: 3,
  watchTime: { total: 3600, average: 36 },
  traffic: { search: 10, recommendations: 30, direct: 50, external: 10 },
  demographics: {
    byDevice: { mobile: 60, tablet: 15, desktop: 25 },
    byCountry: [{ country: "US", viewers: 60 }, { country: "UK", viewers: 20 }],
    byHour: [],
  },
  lastUpdated: new Date(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Analytics API", () => {
  let app;
  let token;

  beforeEach(() => {
    app = buildApp();
    token = makeToken(FAKE_USER_ID);
    jest.clearAllMocks();
  });

  // ── 1. Authentication guard ───────────────────────────────────────────────
  test("1. Rejects unauthenticated requests to /overview", async () => {
    const res = await request(app).get("/api/analytics/overview");
    expect(res.status).toBe(401);
  });

  // ── 2. Overview returns empty state for creator with no videos ────────────
  test("2. Overview returns zeros when creator has no videos", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get("/api/analytics/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalViews).toBe(0);
    expect(res.body.videoCount).toBe(0);
    expect(res.body.topVideo).toBeNull();
  });

  // ── 3. Overview returns aggregated metrics across videos ─────────────────
  test("3. Overview aggregates metrics across multiple videos", async () => {
    const mockVideos = [
      { ...fakeVideo, _id: new mongoose.Types.ObjectId(), views: 100 },
      { ...fakeVideo, _id: new mongoose.Types.ObjectId(), views: 200 },
    ];
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(mockVideos),
    });
    VideoAnalytics.aggregate.mockResolvedValue([
      { totalViews: 300, totalLikes: 40, totalComments: 10, totalShares: 6, totalWatchSecs: 7200 },
    ]);
    VideoAnalytics.findOne.mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({
        totalViews: 200,
        video: { title: "Best Video", views: 200, createdAt: new Date() },
      }),
    });
    User.findById.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue({ friends: [1, 2, 3] }),
    });

    const res = await request(app)
      .get("/api/analytics/overview")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.totalViews).toBe(300);
    expect(res.body.totalLikes).toBe(40);
    expect(res.body.watchTimeMinutes).toBe(120);
    expect(res.body.topVideo).toBeDefined();
  });

  // ── 4. View tracking creates a ViewLog record ─────────────────────────────
  test("4. View tracked correctly – creates ViewLog and increments Video.views", async () => {
    Video.findById.mockResolvedValue({ ...fakeVideo });
    Video.findByIdAndUpdate.mockResolvedValue({ ...fakeVideo, views: 43 });
    ViewLog.create.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
    VideoAnalytics.findOneAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/analytics/track-view/${FAKE_VIDEO_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .set("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(ViewLog.create).toHaveBeenCalledTimes(1);
    expect(Video.findByIdAndUpdate).toHaveBeenCalledWith(
      FAKE_VIDEO_ID,
      { $inc: { views: 1 } }
    );
  });

  // ── 4b. View tracking works without authentication (public route) ──────────
  test("4b. track-view succeeds without an auth token (public endpoint)", async () => {
    Video.findById.mockResolvedValue({ ...fakeVideo });
    Video.findByIdAndUpdate.mockResolvedValue({ ...fakeVideo, views: 43 });
    ViewLog.create.mockResolvedValue({ _id: new mongoose.Types.ObjectId() });
    VideoAnalytics.findOneAndUpdate.mockResolvedValue({});

    const res = await request(app)
      .post(`/api/analytics/track-view/${FAKE_VIDEO_ID}`)
      .set("User-Agent", "Mozilla/5.0");
    // No Authorization header – should still succeed
    expect(res.status).toBe(200);
  });

  // ── 5. View tracking returns 404 for unknown video ────────────────────────
  test("5. View tracking returns 404 for non-existent video", async () => {
    Video.findById.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/analytics/track-view/${FAKE_VIDEO_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  // ── 6. Video list returns per-video metrics ───────────────────────────────
  test("6. /analytics/videos returns list with metrics for each video", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([fakeVideo]),
    });
    VideoAnalytics.find.mockReturnValue({
      lean: jest.fn().mockResolvedValue([fakeAnalytics]),
    });

    const res = await request(app)
      .get("/api/analytics/videos")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("totalViews");
    expect(res.body[0]).toHaveProperty("engagementRate");
  });

  // ── 7. Single video analytics returns detailed breakdown ─────────────────
  test("7. /analytics/videos/:id returns detailed video analytics", async () => {
    Video.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(fakeVideo) });
    VideoAnalytics.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(fakeAnalytics) });
    ViewLog.aggregate.mockResolvedValue([{ date: "2026-02-01", count: 15 }]);

    const res = await request(app)
      .get(`/api/analytics/videos/${FAKE_VIDEO_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("traffic");
    expect(res.body).toHaveProperty("demographics");
    expect(res.body).toHaveProperty("viewTrend");
    expect(res.body.totalViews).toBe(100);
  });

  // ── 8. Video analytics enforces ownership ─────────────────────────────────
  test("8. Access denied when non-owner requests video analytics", async () => {
    const otherUserId = new mongoose.Types.ObjectId().toString();
    Video.findById.mockReturnValue({
      lean: jest.fn().mockResolvedValue({
        ...fakeVideo,
        postedBy: new mongoose.Types.ObjectId(otherUserId),
      }),
    });

    const res = await request(app)
      .get(`/api/analytics/videos/${FAKE_VIDEO_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  // ── 9. Trends returns view data over specified period ─────────────────────
  test("9. /analytics/trends returns view trend data", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([fakeVideo]),
    });
    ViewLog.aggregate.mockResolvedValue([
      { date: "2026-02-22", views: 5 },
      { date: "2026-02-23", views: 8 },
    ]);

    const res = await request(app)
      .get("/api/analytics/trends?period=7d")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.period).toBe("7d");
    expect(Array.isArray(res.body.views)).toBe(true);
  });

  // ── 10. Device analytics returns mobile/desktop/tablet breakdown ──────────
  test("10. /analytics/audience/devices returns device breakdown", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([fakeVideo]),
    });
    ViewLog.aggregate.mockResolvedValue([
      { _id: "mobile", count: 60 },
      { _id: "desktop", count: 30 },
      { _id: "tablet", count: 10 },
    ]);

    const res = await request(app)
      .get("/api/analytics/audience/devices")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mobile).toBe(60);
    expect(res.body.desktop).toBe(30);
    expect(res.body.tablet).toBe(10);
  });

  // ── 11. Peak hours returns hourly distribution ────────────────────────────
  test("11. /analytics/audience/peakHours returns 24-hour activity data", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([fakeVideo]),
    });
    ViewLog.aggregate.mockResolvedValue([
      { hour: 14, viewers: 50 },
      { hour: 20, viewers: 80 },
    ]);

    const res = await request(app)
      .get("/api/analytics/audience/peakHours")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(24); // full 24-hour coverage
    const peak = res.body.find((h) => h.hour === 20);
    expect(peak.viewers).toBe(80);
  });

  // ── 12. Geography returns top countries ───────────────────────────────────
  test("12. /analytics/audience/geography returns country viewer data", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([fakeVideo]),
    });
    ViewLog.aggregate.mockResolvedValue([
      { country: "US", viewers: 100 },
      { country: "UK", viewers: 40 },
    ]);

    const res = await request(app)
      .get("/api/analytics/audience/geography")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ── 13. Traffic sources per video ─────────────────────────────────────────
  test("13. /analytics/traffic-sources/:videoId returns traffic breakdown", async () => {
    Video.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(fakeVideo) });
    ViewLog.aggregate.mockResolvedValue([
      { _id: "direct", count: 50 },
      { _id: "search", count: 20 },
      { _id: "recommendations", count: 25 },
    ]);

    const res = await request(app)
      .get(`/api/analytics/traffic-sources/${FAKE_VIDEO_ID}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.direct).toBe(50);
    expect(res.body.search).toBe(20);
    expect(res.body.recommendations).toBe(25);
  });

  // ── 14. Data privacy – ViewLog stores no PII ─────────────────────────────
  test("14. ViewLog does not persist raw IP or User-Agent string", async () => {
    Video.findById.mockResolvedValue(fakeVideo);
    Video.findByIdAndUpdate.mockResolvedValue({ ...fakeVideo, views: 43 });
    VideoAnalytics.findOneAndUpdate.mockResolvedValue({});

    let capturedViewLog = null;
    ViewLog.create.mockImplementation(async (doc) => {
      capturedViewLog = doc;
      return { _id: new mongoose.Types.ObjectId() };
    });

    await request(app)
      .post(`/api/analytics/track-view/${FAKE_VIDEO_ID}`)
      .set("Authorization", `Bearer ${token}`)
      .set("X-Forwarded-For", "192.168.1.1"); // raw IP should NOT be stored

    expect(capturedViewLog).not.toHaveProperty("ip");
    expect(capturedViewLog).not.toHaveProperty("userAgent");
    // device is derived (not raw UA) – acceptable
    expect(["mobile", "tablet", "desktop", "unknown"]).toContain(capturedViewLog.device);
  });

  // ── 15. Empty geography for creator with no videos ────────────────────────
  test("15. Geography returns empty array when creator has no videos", async () => {
    Video.find.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get("/api/analytics/audience/geography")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
