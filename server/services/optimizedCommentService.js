const Comment = require("../models/Comment");
const mongoose = require("mongoose");
const { cacheableQuery, buildCacheKey } = require("../utils/queryCache");

const getNestedComments = async (videoId = null, postId = null) => {
  const cacheKey = buildCacheKey("comments:nested", {
    videoId: videoId || "null",
    postId: postId || "null",
  });

  return cacheableQuery(cacheKey, async () => {
    const matchFilter = {};
    if (videoId) matchFilter.videoId = new mongoose.Types.ObjectId(videoId);
    if (postId) matchFilter.postId = new mongoose.Types.ObjectId(postId);

    const pipeline = [
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          author: "$userDoc.username",
          authorId: "$userDoc._id",
          content: "$text",
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      {
        $project: {
          _id: 1,
          author: 1,
          authorId: 1,
          content: 1,
          createdAt: 1,
          parentId: 1,
          videoId: 1,
          postId: 1,
          likes: 1,
          likesCount: 1,
        },
      },
      {
        $graphLookup: {
          from: "comments",
          startWith: "$_id",
          connectFromField: "_id",
          connectToField: "parentId",
          as: "allReplies",
          maxDepth: 5,
        },
      },
      {
        $addFields: {
          replyCount: { $size: "$allReplies" },
        },
      },
      {
        $project: {
          allReplies: 0,
        },
      },
    ];

    const comments = await Comment.aggregate(pipeline);

    const commentMap = {};
    comments.forEach((c) => {
      c.replies = [];
      commentMap[c._id.toString()] = c;
    });

    const topLevel = [];
    comments.forEach((c) => {
      const parentIdStr = c.parentId?.toString();
      if (parentIdStr && commentMap[parentIdStr]) {
        commentMap[parentIdStr].replies.push(c);
      } else if (!c.parentId) {
        topLevel.push(c);
      }
    });

    return topLevel;
  }, 180);
};

const getCommentStats = async (resourceId, resourceType) => {
  const cacheKey = buildCacheKey("comments:stats", {
    resourceId,
    resourceType,
  });

  return cacheableQuery(cacheKey, async () => {
    const matchFilter = resourceType === "video"
      ? { videoId: new mongoose.Types.ObjectId(resourceId) }
      : { postId: new mongoose.Types.ObjectId(resourceId) };

    const stats = await Comment.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: null,
          totalComments: { $sum: 1 },
          totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
          uniqueCommenters: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalComments: 1,
          totalLikes: 1,
          uniqueCommenters: { $size: "$uniqueCommenters" },
        },
      },
    ]);

    return stats[0] || { totalComments: 0, totalLikes: 0, uniqueCommenters: 0 };
  }, 120);
};

const getTopComments = async (videoId = null, postId = null, limit = 10) => {
  const cacheKey = buildCacheKey("comments:top", {
    videoId: videoId || "null",
    postId: postId || "null",
    limit,
  });

  return cacheableQuery(cacheKey, async () => {
    const matchFilter = { parentId: null };
    if (videoId) matchFilter.videoId = new mongoose.Types.ObjectId(videoId);
    if (postId) matchFilter.postId = new mongoose.Types.ObjectId(postId);

    const pipeline = [
      { $match: matchFilter },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDoc",
        },
      },
      { $unwind: { path: "$userDoc", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          author: "$userDoc.username",
          authorId: "$userDoc._id",
          content: "$text",
          likesCount: { $size: { $ifNull: ["$likes", []] } },
        },
      },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "parentId",
          as: "replies",
        },
      },
      {
        $addFields: {
          replyCount: { $size: "$replies" },
        },
      },
      {
        $project: {
          _id: 1,
          author: 1,
          authorId: 1,
          content: 1,
          createdAt: 1,
          likes: 1,
          likesCount: 1,
          replyCount: 1,
          videoId: 1,
          postId: 1,
        },
      },
    ];

    return await Comment.aggregate(pipeline);
  }, 180);
};

module.exports = {
  getNestedComments,
  getCommentStats,
  getTopComments,
};
