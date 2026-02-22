const Video = require("../models/Video");
const Post = require("../models/Post");
const User = require("../models/User");
const Comment = require("../models/Comment");
const { getCache, setCache } = require("../utils/cache");
const mongoose = require("mongoose");

const FEED_CACHE_TTL = 60;
const TRENDING_WINDOW_HOURS = 48;

const calculateScore = (item) => {
    const now = Date.now();
    const ageHours = (now - new Date(item.createdAt).getTime()) / (1000 * 60 * 60);

    const likesCount = item.likes ? item.likes.length : 0;
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

const attachCommentCounts = async (items) => {
    if (items.length === 0) return items;

    const videoIds = items
        .filter((i) => i.contentType === "video")
        .map((i) => i._id);
    const postIds = items
        .filter((i) => i.contentType === "post")
        .map((i) => i._id);

    const [videoCounts, postCounts] = await Promise.all([
        videoIds.length > 0
            ? Comment.aggregate([
                { $match: { videoId: { $in: videoIds } } },
                { $group: { _id: "$videoId", count: { $sum: 1 } } },
            ])
            : [],
        postIds.length > 0
            ? Comment.aggregate([
                { $match: { postId: { $in: postIds } } },
                { $group: { _id: "$postId", count: { $sum: 1 } } },
            ])
            : [],
    ]);

    const countMap = {};
    videoCounts.forEach((c) => (countMap[c._id.toString()] = c.count));
    postCounts.forEach((c) => (countMap[c._id.toString()] = c.count));

    return items.map((item) => ({
        ...item,
        commentsCount: countMap[item._id.toString()] || 0,
    }));
};

const fetchItems = async (filter, limit, category) => {
    const categoryFilter = category ? { category } : {};
    const mergedVideoFilter = { ...filter, ...categoryFilter };
    const mergedPostFilter = { ...filter, ...categoryFilter };

    const [videos, posts] = await Promise.all([
        Video.find(mergedVideoFilter)
            .populate("postedBy", "username _id")
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .lean(),
        Post.find(mergedPostFilter)
            .populate("postedBy", "username _id")
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit)
            .lean(),
    ]);

    const taggedVideos = videos.map((v) => ({ ...v, contentType: "video" }));
    const taggedPosts = posts.map((p) => ({ ...p, contentType: "post" }));

    return [...taggedVideos, ...taggedPosts];
};

const getLatestFeed = async (cursor, limit = 20, category) => {
    const cacheKey = `feed:latest:${cursor || "start"}:${limit}:${category || "all"}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const cursorFilter = buildCursorFilter(cursor);
    const items = await fetchItems(cursorFilter, limit + 1, category);

    items.sort((a, b) => {
        const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
        if (dateDiff !== 0) return dateDiff;
        return b._id.toString().localeCompare(a._id.toString());
    });

    const hasMore = items.length > limit;
    const pageItems = items.slice(0, limit);
    const withComments = await attachCommentCounts(pageItems);
    const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

    const result = { data: withComments, nextCursor, hasMore };
    await setCache(cacheKey, result, FEED_CACHE_TTL);
    return result;
};

const getTrendingFeed = async (cursor, limit = 20, category) => {
    const cacheKey = `feed:trending:${cursor || "start"}:${limit}:${category || "all"}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const windowStart = new Date(Date.now() - TRENDING_WINDOW_HOURS * 60 * 60 * 1000);
    const baseFilter = { createdAt: { $gte: windowStart } };
    const cursorFilter = buildCursorFilter(cursor);
    const mergedFilter = { ...baseFilter, ...cursorFilter };

    const batchSize = Math.max(limit * 3, 100);
    const items = await fetchItems(mergedFilter, batchSize, category);
    const withComments = await attachCommentCounts(items);

    withComments.forEach((item) => {
        item.score = calculateScore(item);
    });
    withComments.sort((a, b) => b.score - a.score);

    const startIndex = cursor ? 0 : 0;
    const pageItems = withComments.slice(startIndex, startIndex + limit);
    const hasMore = withComments.length > startIndex + limit;
    const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

    const result = { data: pageItems, nextCursor, hasMore };
    await setCache(cacheKey, result, FEED_CACHE_TTL);
    return result;
};

const getForYouFeed = async (userId, cursor, limit = 20, category) => {
    const cacheKey = `feed:foryou:${userId}:${cursor || "start"}:${limit}:${category || "all"}`;
    const cached = await getCache(cacheKey);
    if (cached) return cached;

    const user = await User.findById(userId).select("friends").lean();
    const friendIds = user?.friends || [];

    const cursorFilter = buildCursorFilter(cursor);
    const batchSize = Math.max(limit * 3, 100);
    const items = await fetchItems(cursorFilter, batchSize, category);
    const withComments = await attachCommentCounts(items);

    const friendIdSet = new Set(friendIds.map((id) => id.toString()));
    withComments.forEach((item) => {
        let score = calculateScore(item);
        const posterId = item.postedBy?._id?.toString() || item.postedBy?.toString();
        if (posterId && friendIdSet.has(posterId)) {
            score *= 1.5;
        }
        item.score = score;
    });
    withComments.sort((a, b) => b.score - a.score);

    const pageItems = withComments.slice(0, limit);
    const hasMore = withComments.length > limit;
    const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

    const result = { data: pageItems, nextCursor, hasMore };
    await setCache(cacheKey, result, FEED_CACHE_TTL);
    return result;
};

const getFollowingFeed = async (userId, cursor, limit = 20, category) => {
    const cacheKey = `feed:following:${userId}:${cursor || "start"}:${limit}:${category || "all"}`;
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

    const [videos, posts] = await Promise.all([
        Video.find({ ...mergedFilter, ...categoryFilter })
            .populate("postedBy", "username _id")
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean(),
        Post.find({ ...mergedFilter, ...categoryFilter })
            .populate("postedBy", "username _id")
            .sort({ createdAt: -1, _id: -1 })
            .limit(limit + 1)
            .lean(),
    ]);

    const taggedVideos = videos.map((v) => ({ ...v, contentType: "video" }));
    const taggedPosts = posts.map((p) => ({ ...p, contentType: "post" }));
    const items = [...taggedVideos, ...taggedPosts];

    items.sort((a, b) => {
        const dateDiff = new Date(b.createdAt) - new Date(a.createdAt);
        if (dateDiff !== 0) return dateDiff;
        return b._id.toString().localeCompare(a._id.toString());
    });

    const hasMore = items.length > limit;
    const pageItems = items.slice(0, limit);
    const withComments = await attachCommentCounts(pageItems);
    const nextCursor = hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null;

    const result = { data: withComments, nextCursor, hasMore };
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
