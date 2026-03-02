const Video = require("../models/Video");
const User = require("../models/User");

/**
 * GET /api/search?q=query&limit=10&page=1&type=all|videos|users|hashtags&sortBy=relevance|date|views
 */
const search = async (req, res) => {
  try {
    const { q = "", limit = 10, page = 1, type = "all", sortBy = "relevance" } = req.query;
    const query = q.trim();

    if (!query) {
      return res.json({ videos: [], users: [], hashtags: [], total: 0, videoTotal: 0, userTotal: 0, hashtagTotal: 0 });
    }

    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const results = {};

    // ─── Videos ───────────────────────────────────────────
    if (type === "all" || type === "videos") {
      const videoFilter = {
        flagged: false,
        $or: [
          { title: regex },
          { description: regex },
          { hashtags: regex },
          { category: regex },
        ],
      };

      let videoSort = { createdAt: -1 };
      if (sortBy === "views") videoSort = { views: -1 };
      else if (sortBy === "date") videoSort = { uploadDate: -1 };
      // "relevance" is an alias for recency — no text-score index available yet
      // else if (sortBy === "relevance") videoSort = { createdAt: -1 }; // already the default

      const [videos, videoTotal] = await Promise.all([
        Video.find(videoFilter)
          .sort(videoSort)
          .skip(type === "all" ? 0 : skip)
          .limit(type === "all" ? 6 : limitNum)
          .populate("postedBy", "username bio")
          .lean(),
        Video.countDocuments(videoFilter),
      ]);

      results.videos = videos;
      results.videoTotal = videoTotal;
    }

    // ─── Users ────────────────────────────────────────────
    if (type === "all" || type === "users") {
      const userFilter = {
        $or: [{ username: regex }, { bio: regex }],
      };

      const [users, userTotal] = await Promise.all([
        User.find(userFilter)
          .select("username bio createdAt")
          .skip(type === "all" ? 0 : skip)
          .limit(type === "all" ? 6 : limitNum)
          .lean(),
        User.countDocuments(userFilter),
      ]);

      results.users = users;
      results.userTotal = userTotal;
    }

    // ─── Hashtags ─────────────────────────────────────────
    if (type === "all" || type === "hashtags") {
      // Aggregate hashtags stored in videos.hashtags array
      const hashtagAgg = await Video.aggregate([
        { $match: { flagged: false } },
        { $unwind: "$hashtags" },
        { $match: { hashtags: regex } },
        {
          $group: {
            _id: "$hashtags",
            count: { $sum: 1 },
            latestVideo: { $last: "$_id" },
          },
        },
        { $sort: { count: -1 } },
        ...(type === "all" ? [{ $limit: 10 }] : [{ $skip: skip }, { $limit: limitNum }]),
      ]);

      // Also extract inline hashtags from title/description for videos that
      // don't use the tags field
      const inlineAgg = await Video.aggregate([
        { $match: { flagged: false } },
        {
          $project: {
            words: {
              $concatArrays: [
                {
                  $map: {
                    input: { $split: [{ $ifNull: ["$title", ""] }, " "] },
                    as: "w",
                    in: "$$w",
                  },
                },
                {
                  $map: {
                    input: { $split: [{ $ifNull: ["$description", ""] }, " "] },
                    as: "w",
                    in: "$$w",
                  },
                },
              ],
            },
          },
        },
        { $unwind: "$words" },
        { $match: { words: /^#\w+/i } },
        {
          $group: {
            _id: { $toLower: "$words" },
            count: { $sum: 1 },
          },
        },
        { $match: { _id: regex } },
        { $sort: { count: -1 } },
        { $limit: type === "all" ? 10 : limitNum },
      ]);

      // Merge both hashtag sources, deduplicate
      const merged = {};
      for (const h of [...hashtagAgg, ...inlineAgg]) {
        const tag = h._id;
        if (!merged[tag]) merged[tag] = { tag, count: 0 };
        merged[tag].count += h.count;
      }
      const allHashtags = Object.values(merged)
        .sort((a, b) => b.count - a.count);
      const hashtagTotal = allHashtags.length;
      const hashtags = allHashtags.slice(0, type === "all" ? 10 : limitNum);

      results.hashtags = hashtags;
      results.hashtagTotal = hashtagTotal;
    }

    return res.json(results);
  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ error: "Search failed" });
  }
};

/**
 * GET /api/search/suggestions?q=query
 * Returns fast autocomplete suggestions (titles + usernames)
 */
const suggestions = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const query = q.trim();
    if (!query || query.length < 2) return res.json([]);

    const regex = new RegExp("^" + query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const [videoTitles, usernames] = await Promise.all([
      Video.find({ title: regex, flagged: false })
        .select("title")
        .limit(5)
        .lean(),
      User.find({ username: regex })
        .select("username")
        .limit(5)
        .lean(),
    ]);

    const results = [
      ...videoTitles.map((v) => ({ type: "video", label: v.title })),
      ...usernames.map((u) => ({ type: "user", label: u.username })),
    ].slice(0, 8);

    return res.json(results);
  } catch (err) {
    console.error("Suggestions error:", err);
    return res.status(500).json([]);
  }
};

module.exports = { search, suggestions };
