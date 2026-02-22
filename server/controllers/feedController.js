const {
    getLatestFeed,
    getTrendingFeed,
    getForYouFeed,
    getFollowingFeed,
} = require("../services/feedService");

const VALID_TYPES = ["latest", "trending", "for-you", "following"];

exports.getFeed = async (req, res) => {
    try {
        const { type } = req.params;
        if (!VALID_TYPES.includes(type)) {
            return res.status(400).json({ message: `Invalid feed type. Use: ${VALID_TYPES.join(", ")}` });
        }

        const cursor = req.query.cursor || null;
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 50);
        const category = req.query.category || undefined;

        let result;

        switch (type) {
            case "latest":
                result = await getLatestFeed(cursor, limit, category);
                break;

            case "trending":
                result = await getTrendingFeed(cursor, limit, category);
                break;

            case "for-you":
                if (!req.user?.id) {
                    return res.status(401).json({ message: "Login required for personalized feed" });
                }
                result = await getForYouFeed(req.user.id, cursor, limit, category);
                break;

            case "following":
                if (!req.user?.id) {
                    return res.status(401).json({ message: "Login required for following feed" });
                }
                result = await getFollowingFeed(req.user.id, cursor, limit, category);
                break;
        }

        res.json(result);
    } catch (err) {
        console.error("Feed error:", err);
        res.status(500).json({ message: "Error loading feed", error: err.message });
    }
};
