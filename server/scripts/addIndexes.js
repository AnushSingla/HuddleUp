const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const addOptimizedIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    console.log("\n📊 Adding optimized indexes...\n");

    await db.collection("videos").createIndex(
      { likes: 1 },
      { name: "idx_video_likes" }
    );
    console.log("✅ Video likes index created");

    await db.collection("videos").createIndex(
      { views: -1 },
      { name: "idx_video_views_desc" }
    );
    console.log("✅ Video views index created");

    await db.collection("videos").createIndex(
      { createdAt: -1, views: -1 },
      { name: "idx_video_trending" }
    );
    console.log("✅ Video trending compound index created");

    await db.collection("videos").createIndex(
      { postedBy: 1, createdAt: -1 },
      { name: "idx_video_user_timeline" }
    );
    console.log("✅ Video user timeline index created");

    await db.collection("videos").createIndex(
      { category: 1, createdAt: -1 },
      { name: "idx_video_category_timeline" }
    );
    console.log("✅ Video category timeline index created");

    await db.collection("videos").createIndex(
      { processingStatus: 1 },
      { name: "idx_video_processing_status" }
    );
    console.log("✅ Video processing status index created");

    await db.collection("posts").createIndex(
      { likes: 1 },
      { name: "idx_post_likes" }
    );
    console.log("✅ Post likes index created");

    await db.collection("posts").createIndex(
      { views: -1 },
      { name: "idx_post_views_desc" }
    );
    console.log("✅ Post views index created");

    await db.collection("posts").createIndex(
      { createdAt: -1, views: -1 },
      { name: "idx_post_trending" }
    );
    console.log("✅ Post trending compound index created");

    await db.collection("posts").createIndex(
      { postedBy: 1, createdAt: -1 },
      { name: "idx_post_user_timeline" }
    );
    console.log("✅ Post user timeline index created");

    await db.collection("comments").createIndex(
      { videoId: 1, createdAt: -1 },
      { name: "idx_comment_video_timeline" }
    );
    console.log("✅ Comment video timeline index created");

    await db.collection("comments").createIndex(
      { postId: 1, createdAt: -1 },
      { name: "idx_comment_post_timeline" }
    );
    console.log("✅ Comment post timeline index created");

    await db.collection("comments").createIndex(
      { parentId: 1 },
      { name: "idx_comment_parent" }
    );
    console.log("✅ Comment parent index created");

    await db.collection("comments").createIndex(
      { userId: 1, createdAt: -1 },
      { name: "idx_comment_user_timeline" }
    );
    console.log("✅ Comment user timeline index created");

    await db.collection("users").createIndex(
      { friends: 1 },
      { name: "idx_user_friends" }
    );
    console.log("✅ User friends index created");

    await db.collection("users").createIndex(
      { savedVideos: 1 },
      { name: "idx_user_saved_videos" }
    );
    console.log("✅ User saved videos index created");

    await db.collection("users").createIndex(
      { savedPosts: 1 },
      { name: "idx_user_saved_posts" }
    );
    console.log("✅ User saved posts index created");

    await db.collection("notifications").createIndex(
      { recipient: 1, createdAt: -1 },
      { name: "idx_notification_recipient_timeline" }
    );
    console.log("✅ Notification recipient timeline index created");

    await db.collection("notifications").createIndex(
      { recipient: 1, read: 1, createdAt: -1 },
      { name: "idx_notification_unread" }
    );
    console.log("✅ Notification unread index created");

    await db.collection("notifications").createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: "idx_notification_ttl" }
    );
    console.log("✅ Notification TTL index created");

    console.log("\n✅ All indexes created successfully!");
    console.log("\n📋 Listing all indexes:\n");

    const collections = ["videos", "posts", "comments", "users", "notifications"];
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`${collectionName}:`);
      indexes.forEach(idx => {
        console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      });
      console.log();
    }

    await mongoose.connection.close();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error adding indexes:", error);
    process.exit(1);
  }
};

addOptimizedIndexes();
