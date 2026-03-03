const Video = require("../models/Video");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { getCache, setCache } = require("../utils/cache");
const mongoose = require("mongoose");

const FEED_CACHE_TTL = 300;
const TRENDING_WINDOW_HOURS = 48;

const calculateScore = (item) => {
  const now = Date.now();
  const ageHours = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);

  const likesCount = item.likesCount || 0;
  const commentsCount = item.commentsCount || 0;
  const viewsCount = item.views || 0;

  const engagement = likesCount * 3 + commentsCount * 5 + viewsCount * 0.5;
  const gravity = 1.8;
  const engagementScore = engagement / Math.pow(ageHours + 2, gravity);
  const recencyScore = 1 / Math.pow(ageHours + 2, 0.5);

  let trendingBoost = 0;
  if (ageHours < TRENDING_WINDOW_HOURS) {
    const recentEngagement = likesCount + commentsCount;
    trendingBoost = recentEngagement / Math.pow(ageHours + 1, 0.5);
  }

  return engagementScore + recencyScore + trendingBoost;
};

const buildCursorFilter = (cursor) => {
  if (!cursor) return {};
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString());
    return {
      $or: [
        { createdAt: { $lt: new Date(decoded.createdAt) } },
        {
          createdAt: new Date(decoded.createdAt),
          _id: { $lt: new mongoose.Types.ObjectId(decoded.id) },
        },
      ],
    };
  } catch {
    return {};
  }
};

const encodeCursor = (item) => {
  const payload = { createdAt: item.createdAt, id: item._id.toString() };
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
};

const fetchItemsOptimized = async (filter, limit, category) => {
  const categoryFilter = category ? { category } : {};
  const mergedVideoFilter = { ...filter, ...categoryFilter };
  const mergedPostFilter = { ...filter, ...categoryFilter };

  const videoPipeline = [
    { $match: mergedVideoFilter },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedByDoc",
      },
    },
    { $unwind: { path: "$postedByDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "videoId",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: "$comments" },
        contentType: "video",
        postedBy: {
          _id: "$postedByDoc._id",
          username: "$postedByDoc.username",
        },
      },
    },
    {
      $project: {
        postedByDoc: 0,
        comments: 0,
      },
    },
  ];

  const postPipeline = [
    { $match: mergedPostFilter },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedByDoc",
      },
    },
    { $unwind: { path: "$postedByDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: "$comments" },
        contentType: "post",
        postedBy: {
          _id: "$postedByDoc._id",
          username: "$postedByDoc.username",
        },
      },
    },
    {
      $project: {
        postedByDoc: 0,
        comments: 0,
      },
    },
  ];

  const [videos, posts] = await Promise.all([
    Video.aggregate(videoPipeline),
    Post.aggregate(postPipeline),
  ]);

  return [...videos, ...posts];
};

const getLatestFeed = async (cursor, limit = 20, category) => {
  const cacheKey = `feed:latest:v2:${cursor || "start"}:${limit}:${category || "all"}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const cursorFilter = buildCursorFilter(cursor);
  const items = await fetchItemsOptimized(cursorFilter, limit + 1, category);

  items.sort((a, b) => {
    const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
    if (dateDiff !== 0) return dateDiff;
    return b._id.toString().localeCompare(a._id.toString());
  });

  const hasMore = items.length > limit;
  const pageItems = items.slice(0, limit);
  const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

  const result = { data: pageItems, nextCursor, hasMore };
  await setCache(cacheKey, result, FEED_CACHE_TTL);
  return result;
};

const getTrendingFeed = async (cursor, limit = 20, category) => {
  const cacheKey = `feed:trending:v2:${cursor || "start"}:${limit}:${category || "all"}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const windowStart = new Date(Date.now() - TRENDING_WINDOW_HOURS * 60 * 60 * 1000);
  const baseFilter = { createdAt: { $gte: windowStart } };
  const cursorFilter = buildCursorFilter(cursor);
  const mergedFilter = { ...baseFilter, ...cursorFilter };

  const batchSize = Math.max(limit * 3, 100);
  const items = await fetchItemsOptimized(mergedFilter, batchSize, category);

  items.forEach((item) => {
    item.score = calculateScore(item);
  });
  items.sort((a, b) => b.score - a.score);

  const pageItems = items.slice(0, limit);
  const hasMore = items.length > limit;
  const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

  const result = { data: pageItems, nextCursor, hasMore };
  await setCache(cacheKey, result, FEED_CACHE_TTL);
  return result;
};

const getForYouFeed = async (userId, cursor, limit = 20, category) => {
  const cacheKey = `feed:foryou:v2:${userId}:${cursor || "start"}:${limit}:${category || "all"}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select("friends").lean();
  const friendIds = user?.friends || [];

  const cursorFilter = buildCursorFilter(cursor);
  const batchSize = Math.max(limit * 3, 100);
  const items = await fetchItemsOptimized(cursorFilter, batchSize, category);

  const friendIdSet = new Set(friendIds.map((id) => id.toString()));
  items.forEach((item) => {
    let score = calculateScore(item);
    const posterId = item.postedBy?._id?.toString() || item.postedBy?.toString();
    if (posterId && friendIdSet.has(posterId)) {
      score *= 1.5;
    }
    item.score = score;
  });
  items.sort((a, b) => b.score - a.score);

  const pageItems = items.slice(0, limit);
  const hasMore = items.length > limit;
  const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

  const result = { data: pageItems, nextCursor, hasMore };
  await setCache(cacheKey, result, FEED_CACHE_TTL);
  return result;
};

const getFollowingFeed = async (userId, cursor, limit = 20, category) => {
  const cacheKey = `feed:following:v2:${userId}:${cursor || "start"}:${limit}:${category || "all"}`;
  const cached = await getCache(cacheKey);
  if (cached) return cached;

  const user = await User.findById(userId).select("friends").lean();
  const friendIds = user?.friends || [];

  if (friendIds.length === 0) {
    return { data: [], nextCursor: null, hasMore: false };
  }

  const cursorFilter = buildCursorFilter(cursor);
  const postedByFilter = { postedBy: { $in: friendIds } };
  const mergedFilter = { ...cursorFilter, ...postedByFilter };
  const categoryFilter = category ? { category } : {};

  const videoPipeline = [
    { $match: { ...mergedFilter, ...categoryFilter } },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit + 1 },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedByDoc",
      },
    },
    { $unwind: { path: "$postedByDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "videoId",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: "$comments" },
        contentType: "video",
        postedBy: {
          _id: "$postedByDoc._id",
          username: "$postedByDoc.username",
        },
      },
    },
    {
      $project: {
        postedByDoc: 0,
        comments: 0,
      },
    },
  ];

  const postPipeline = [
    { $match: { ...mergedFilter, ...categoryFilter } },
    { $sort: { createdAt: -1, _id: -1 } },
    { $limit: limit + 1 },
    {
      $lookup: {
        from: "users",
        localField: "postedBy",
        foreignField: "_id",
        as: "postedByDoc",
      },
    },
    { $unwind: { path: "$postedByDoc", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "postId",
        as: "comments",
      },
    },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
        commentsCount: { $size: "$comments" },
        contentType: "post",
        postedBy: {
          _id: "$postedByDoc._id",
          username: "$postedByDoc.username",
        },
      },
    },
    {
      $project: {
        postedByDoc: 0,
        comments: 0,
      },
    },
  ];

  const [videos, posts] = await Promise.all([
    Video.aggregate(videoPipeline),
    Post.aggregate(postPipeline),
  ]);

  const items = [...videos, ...posts];

  items.sort((a, b) => {
    const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
    if (dateDiff !== 0) return dateDiff;
    return b._id.toString().localeCompare(a._id.toString());
  });

  const hasMore = items.length > limit;
  const pageItems = items.slice(0, limit);
  const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

  const result = { data: pageItems, nextCursor, hasMore };
  await setCache(cacheKey, result, FEED_CACHE_TTL);
  return result;
};

module.exports = {
  calculateScore,
  getLatestFeed,
  getTrendingFeed,
  getForYouFeed,
  getFollowingFeed,
};
