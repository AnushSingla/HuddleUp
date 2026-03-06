const { videoQueue } = require("../services/videoQueue");
const { processVideo } = require("../services/ffmpegService");
const { uploadToCloudinary } = require("../services/cloudinaryService");
const Video = require("../models/Video");
const fs = require("fs").promises;
const path = require("path");

// Process video jobs from the queue
videoQueue.process(async (job) => {
  const { videoId, filePath } = job.data;

  try {
    console.log(`🎬 Processing video ${videoId}...`);

    // Update status to processing
    await Video.findByIdAndUpdate(videoId, {
      processingStatus: "processing",
      processingProgress: 10,
    });
    await job.progress(10);

    // Step 1: Process video with FFmpeg
    console.log(`📹 Running FFmpeg processing...`);
    const processedFiles = await processVideo(filePath, (progress) => {
      job.progress(10 + progress * 0.5); // 10-60%
    });

    await Video.findByIdAndUpdate(videoId, {
      processingProgress: 60,
    });

    // Step 2: Upload to Cloudinary
    console.log(`☁️ Uploading to Cloudinary...`);
    const uploadResults = await uploadToCloudinary(
      processedFiles,
      videoId,
      (progress) => {
        job.progress(60 + progress * 0.3); // 60-90%
      }
    );

    await Video.findByIdAndUpdate(videoId, {
      processingProgress: 90,
    });

    // Step 3: Update database with results
    console.log(`💾 Updating database...`);
    await Video.findByIdAndUpdate(videoId, {
      videoVersions: uploadResults.videoVersions,
      thumbnails: uploadResults.thumbnails,
      cdnUrl: uploadResults.cdnUrl,
      metadata: uploadResults.metadata,
      processingStatus: "completed",
      processingProgress: 100,
    });

    // Step 4: Cleanup temp files
    console.log(`🧹 Cleaning up temp files...`);
    await cleanupFiles([filePath, ...processedFiles.allFiles]);

    await job.progress(100);
    console.log(`✅ Video ${videoId} processed successfully!`);

    return { success: true, videoId };
  } catch (error) {
    console.error(`❌ Error processing video ${videoId}:`, error);

    // Update status to failed
    await Video.findByIdAndUpdate(videoId, {
      processingStatus: "failed",
      processingProgress: 0,
    });

    // Cleanup on failure
    try {
      await cleanupFiles([filePath]);
    } catch (cleanupError) {
      console.error("Cleanup error:", cleanupError);
    }

    throw error;
  }
});

// Cleanup temporary files
async function cleanupFiles(filePaths) {
  for (const filePath of filePaths) {
    try {
      await fs.unlink(filePath);
      console.log(`🗑️ Deleted: ${filePath}`);
    } catch (err) {
      if (err.code !== "ENOENT") {
        console.error(`Failed to delete ${filePath}:`, err);
      }
    }
  }
}

// Event listeners
videoQueue.on("completed", (job, result) => {
  console.log(`✅ Job ${job.id} completed:`, result);
});

videoQueue.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err.message);
});

videoQueue.on("progress", (job, progress) => {
  console.log(`📊 Job ${job.id} progress: ${progress}%`);
});

console.log("🎥 Video processor worker started");

module.exports = { videoQueue };
