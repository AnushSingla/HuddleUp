const { createQueue } = require("../config/bull");
const path = require("path");
const fs = require("fs").promises;
const {
  generateThumbnails,
  generateMultipleQualities,
  getVideoMetadata,
} = require("./ffmpegService");
const {
  uploadVideo,
  uploadImage,
  cleanupLocalFile,
} = require("./cloudinaryService");
const Video = require("../models/Video");

const videoQueue = createQueue("video-processing", {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

videoQueue.process(async (job) => {
  const { videoId, inputPath, userId } = job.data;

  try {
    await job.progress(10);

    const tempDir = path.join(__dirname, "..", "temp", `video-${videoId}`);
    await fs.mkdir(tempDir, { recursive: true });

    await job.progress(20);

    const metadata = await getVideoMetadata(inputPath);
    await Video.findByIdAndUpdate(videoId, {
      "metadata.duration": metadata.duration,
      "metadata.resolution": `${metadata.width}x${metadata.height}`,
      "metadata.codec": metadata.codec,
      "metadata.fileSize": metadata.fileSize,
    });

    await job.progress(30);

    const thumbnailPaths = await generateThumbnails(inputPath, tempDir, 5);
    const thumbnailUrls = [];

    for (const thumbPath of thumbnailPaths) {
      const { url } = await uploadImage(thumbPath);
      thumbnailUrls.push(url);
      await cleanupLocalFile(thumbPath);
    }

    await Video.findByIdAndUpdate(videoId, { thumbnails: thumbnailUrls });
    await job.progress(50);

    const qualityVideos = await generateMultipleQualities(inputPath, tempDir);
    const videoVersions = {};

    let progressIncrement = 40 / Object.keys(qualityVideos).length;
    let currentProgress = 50;

    for (const [quality, videoPath] of Object.entries(qualityVideos)) {
      const { url } = await uploadVideo(videoPath);
      videoVersions[quality] = url;
      await cleanupLocalFile(videoPath);
      
      currentProgress += progressIncrement;
      await job.progress(Math.min(currentProgress, 90));
    }

    const { url: originalUrl } = await uploadVideo(inputPath);
    videoVersions.original = originalUrl;

    await Video.findByIdAndUpdate(videoId, {
      videoVersions,
      videoUrl: videoVersions["720p"] || videoVersions["480p"] || originalUrl,
      cdnUrl: originalUrl,
      processingStatus: "completed",
      processingProgress: 100,
    });

    await job.progress(95);

    await cleanupLocalFile(inputPath);
    await fs.rmdir(tempDir, { recursive: true });

    await job.progress(100);

    return { videoId, status: "completed", videoVersions, thumbnails: thumbnailUrls };
  } catch (error) {
    await Video.findByIdAndUpdate(videoId, {
      processingStatus: "failed",
      processingError: error.message,
    });

    throw error;
  }
});

videoQueue.on("completed", (job, result) => {
  console.log(`✅ Video processing completed: ${result.videoId}`);
});

videoQueue.on("failed", (job, err) => {
  console.error(`❌ Video processing failed: ${job.data.videoId}`, err.message);
});

const addVideoToQueue = async (videoId, inputPath, userId) => {
  const job = await videoQueue.add({
    videoId,
    inputPath,
    userId,
  });

  return job.id;
};

const getJobStatus = async (jobId) => {
  const job = await videoQueue.getJob(jobId);
  if (!job) return null;

  const state = await job.getState();
  const progress = job.progress();

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
  };
};

module.exports = {
  videoQueue,
  addVideoToQueue,
  getJobStatus,
};
