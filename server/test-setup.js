// Test script to verify video processing setup
const ffmpeg = require("fluent-ffmpeg");
const { createClient } = require("redis");

console.log("🧪 Testing Video Processing Setup...\n");

// Test 1: FFmpeg
console.log("1️⃣ Testing FFmpeg...");
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    console.error("❌ FFmpeg not found or not working:", err.message);
    console.log("   Install FFmpeg: https://ffmpeg.org/download.html");
  } else {
    console.log("✅ FFmpeg is working!");
    console.log(`   Available formats: ${Object.keys(formats).length}`);
  }
});

// Test 2: Redis
console.log("\n2️⃣ Testing Redis connection...");
const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redis = createClient({ url: redisUrl });

redis.on("error", (err) => {
  console.error("❌ Redis connection failed:", err.message);
  console.log("   Make sure Redis is running: redis-server");
  process.exit(1);
});

redis.on("connect", () => {
  console.log("✅ Redis is connected!");
  redis.quit();
});

redis.connect();

// Test 3: Cloudinary (if configured)
console.log("\n3️⃣ Testing Cloudinary configuration...");
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  console.log("✅ Cloudinary credentials found!");
  console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
} else {
  console.log("⚠️  Cloudinary not configured (optional)");
  console.log("   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
}

console.log("\n✨ Setup test complete!");
