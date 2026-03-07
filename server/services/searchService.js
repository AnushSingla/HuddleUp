const Video = require("../models/Video");
const Post = require("../models/Post");
const User = require("../models/User");
const { getRedisClient, isRedisReady } = require("../config/redis");

const CACHE_TTL = 300;

const getCacheKey = (query, type, sortBy, page, limit) => {
  return `search:${query}:${type}:${sortBy}:${page}:${limit}`;
};

const performSearch = async (query, type, sortBy, page, limit, filters = {}) => {
  const skip = (page - 1) * limit;
  const results = {};
  const regex = new RegExp(query, "i");

  if (type === "all" || type === "videos") {
    // Build optimized filter to use indexes effectively
    const filter = {
      flagged: false,
      processingStatus: "completed",
      isDeleted: false, // Ensure we only get active content
      $or: [
        { title: regex },
        { description: regex },
        { hashtags: regex },
        { category: regex }
      ]
    };

    // Apply category filter first for better index usage
    if (filters.category && filters.category !== "all") {
      filter.category = filters.category;
      // Remove category from $or when we have a specific category filter
      filter.$or = [
        { title: regex },
        { description: regex },
        { hashtags: regex }
      ];
    }

    if (filters.dateFrom) {
      filter.uploadDate = { $gte: new Date(filters.dateFrom) };
    }

    if (filters.minViews) {
      filter.views = { $gte: parseInt(filters.minViews) };
    }

    // Optimize sort to use compound indexes
    let sort = { createdAt: -1 };
    if (sortBy === "views") {
      sort = { views: -1, createdAt: -1 }; // Use compound index
    } else if (sortBy === "date") {
      sort = { uploadDate: -1, _id: -1 }; // Add _id for consistent pagination
    } else if (sortBy === "popularity") {
      sort = { views: -1, createdAt: -1 };
    }

    const [videos, videoTotal] = await Promise.all([
      Video.find(filter)
        .sort(sort)
        .skip(type === "all" ? 0 : skip)
        .limit(type === "all" ? 6 : limit)
        .populate("postedBy", "username bio")
        .lean(),
      Video.countDocuments(filter)
    ]);

    results.videos = videos;
    results.videoTotal = videoTotal;
  }

  if (type === "all" || type === "posts") {
    // Build optimized filter to use indexes effectively
    const filter = {
      flagged: false,
      isDeleted: false, // Ensure we only get active content
      $or: [
        { title: regex },
        { content: regex },
        { category: regex }
      ]
    };

    // Apply category filter first for better index usage
    if (filters.category && filters.category !== "all") {
      filter.category = filters.category;
      // Remove category from $or when we have a specific category filter
      filter.$or = [
        { title: regex },
        { content: regex }
      ];
    }

    if (filters.dateFrom) {
      filter.createdAt = { $gte: new Date(filters.dateFrom) };
    }

    if (filters.minViews) {
      filter.views = { $gte: parseInt(filters.minViews) };
    }

    // Optimize sort to use compound indexes
    let sort = { createdAt: -1, _id: -1 }; // Use compound index for pagination
    if (sortBy === "views") {
      sort = { views: -1, createdAt: -1 };
    } else if (sortBy === "popularity") {
      sort = { views: -1, createdAt: -1 };
    }

    const [posts, postTotal] = await Promise.all([
      Post.find(filter)
        .sort(sort)
        .skip(type === "all" ? 0 : skip)
        .limit(type === "all" ? 6 : limit)
        .populate("postedBy", "username bio")
        .lean(),
      Post.countDocuments(filter)
    ]);

    results.posts = posts;
    results.postTotal = postTotal;
  }

  if (type === "all" || type === "users") {
    const filter = {
      $or: [
        { username: regex },
        { bio: regex }
      ]
    };

    const [users, userTotal] = await Promise.all([
      User.find(filter)
        .select("username bio createdAt")
        .sort({ createdAt: -1 }) // Add consistent sorting
        .skip(type === "all" ? 0 : skip)
        .limit(type === "all" ? 6 : limit)
        .lean(),
      User.countDocuments(filter)
    ]);

    results.users = users;
    results.userTotal = userTotal;
  }

  if (type === "all" || type === "hashtags") {
    // Optimize hashtag aggregation with better matching
    const hashtags = await Video.aggregate([
      { 
        $match: { 
          flagged: false, 
          processingStatus: "completed",
          isDeleted: false,
          hashtags: regex // Use index on hashtags field
        } 
      },
      { $unwind: "$hashtags" },
      { $match: { hashtags: regex } },
      {
        $group: {
          _id: "$hashtags",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: type === "all" ? 10 : limit }
    ]);

    results.hashtags = hashtags.map(h => ({ tag: h._id, count: h.count }));
    results.hashtagTotal = hashtags.length;
  }

  return results;
};

const getCachedResults = async (cacheKey) => {
  if (!isRedisReady()) return null;
  try {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    return cached ? JSON.parse(cached) : null;
  } catch (err) {
    return null;
  }
};

const setCachedResults = async (cacheKey, data) => {
  if (!isRedisReady()) return;
  try {
    const redis = getRedisClient();
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(data));
  } catch (err) {
    console.error("Cache error:", err);
  }
};

const getAutocompleteSuggestions = async (query) => {
  const regex = new RegExp("^" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  const [videoTitles, usernames] = await Promise.all([
    Video.find({ 
      title: regex, 
      flagged: false, 
      processingStatus: "completed",
      isDeleted: false // Only active content
    })
      .select("title")
      .sort({ views: -1 }) // Sort by popularity for better suggestions
      .limit(5)
      .lean(),
    User.find({ username: regex })
      .select("username")
      .sort({ createdAt: -1 }) // Sort by recency
      .limit(5)
      .lean()
  ]);

  return [
    ...videoTitles.map(v => ({ type: "video", label: v.title })),
    ...usernames.map(u => ({ type: "user", label: u.username }))
  ].slice(0, 10);
};

module.exports = {
  performSearch,
  getAutocompleteSuggestions,
  getTrendingSearches,
  recordSearchHistory,
  getSearchHistory,
  getCacheKey,
  getCachedResults,
  setCachedResults
};


const getTrendingSearches = async () => {
  const cacheKey = "trending:searches";
  const cached = await getCachedResults(cacheKey);
  if (cached) return cached;

  const trending = await Video.aggregate([
    { 
      $match: { 
        flagged: false, 
        processingStatus: "completed",
        isDeleted: false, // Only active content
        hashtags: { $exists: true, $ne: [] } // Only videos with hashtags
      } 
    },
    { $unwind: "$hashtags" },
    { $group: { _id: "$hashtags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
    { $project: { query: "$_id", count: 1, _id: 0 } }
  ]);

  await setCachedResults(cacheKey, trending);
  return trending;
};

const recordSearchHistory = async (userId, query, resultCount) => {
  if (!userId || !isRedisReady()) return;
  try {
    const redis = getRedisClient();
    const key = `search:history:${userId}`;
    const entry = JSON.stringify({ query, resultCount, timestamp: Date.now() });
    await redis.lpush(key, entry);
    await redis.ltrim(key, 0, 19);
    await redis.expire(key, 2592000);
  } catch (err) {
    console.error("History error:", err);
  }
};

const getSearchHistory = async (userId) => {
  if (!userId || !isRedisReady()) return [];
  try {
    const redis = getRedisClient();
    const key = `search:history:${userId}`;
    const history = await redis.lrange(key, 0, 19);
    return history.map(h => JSON.parse(h));
  } catch (err) {
    return [];
  }
};
