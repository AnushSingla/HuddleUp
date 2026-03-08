// Test script to verify video processing setup
const ffmpeg = require("fluent-ffmpeg");
const { createClient } = require("redis");
const logger = require("./utils/logger");

logger.info("🧪 Testing Video Processing Setup...\n");

// Test 1: FFmpeg
logger.info("1️⃣ Testing FFmpeg...");
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    logger.error("❌ FFmpeg not found or not working:", { error: err.message });
    logger.info("   Install FFmpeg: https://ffmpeg.org/download.html");
  } else {
    logger.info("✅ FFmpeg is working!");
    logger.info(`   Available formats: ${Object.keys(formats).length}`);
  }
});

// Test 2: Redis
logger.info("\n2️⃣ Testing Redis connection...");
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = createClient({ url: redisUrl });

redis.on("error", (err) => {
  logger.error("❌ Redis connection failed:", { error: err.message });
  logger.info("   Make sure Redis is running: redis-server");
  process.exit(1);
});

redis.on("connect", () => {
  logger.info("✅ Redis is connected!");
  redis.quit();
});

redis.connect();

// Test 3: Cloudinary (if configured)
logger.info("\n3️⃣ Testing Cloudinary configuration...");
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  logger.info("✅ Cloudinary credentials found!");
  logger.info(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
  logger.warn("⚠️  Cloudinary not configured (optional)");
  logger.info("   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
}

logger.info("\n✨ Setup test complete!");
