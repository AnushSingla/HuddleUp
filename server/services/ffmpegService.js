const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs").promises;
const crypto = require("crypto");

const QUALITY_PRESETS = {
  "360p": { width: 640, height: 360, bitrate: "500k" },
  "480p": { width: 854, height: 480, bitrate: "1000k" },
  "720p": { width: 1280, height: 720, bitrate: "2500k" },
  "1080p": { width: 1920, height: 1080, bitrate: "5000k" },
};

const getVideoMetadata = (inputPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);
      
      const videoStream = metadata.streams.find(s => s.codec_type === "video");
      if (!videoStream) return reject(new Error("No video stream found"));

      resolve({
        duration: metadata.format.duration,
        width: videoStream.width,
        height: videoStream.height,
        bitrate: metadata.format.bit_rate,
        codec: videoStream.codec_name,
        fileSize: metadata.format.size,
      });
    });
  });
};

const compressVideo = (inputPath, outputPath, quality = "720p") => {
  return new Promise((resolve, reject) => {
    const preset = QUALITY_PRESETS[quality] || QUALITY_PRESETS["720p"];

    ffmpeg(inputPath)
      .videoCodec("libx264")
      .audioCodec("aac")
      .size(`${preset.width}x${preset.height}`)
      .videoBitrate(preset.bitrate)
      .audioBitrate("128k")
      .outputOptions([
        "-preset fast",
        "-crf 23",
        "-movflags +faststart",
      ])
      .output(outputPath)
      .on("end", () => resolve(outputPath))
      .on("error", reject)
      .run();
  });
};

const generateThumbnails = (inputPath, outputDir, count = 5) => {
  return new Promise(async (resolve, reject) => {
    try {
      const metadata = await getVideoMetadata(inputPath);
      const duration = metadata.duration;
      const interval = duration / (count + 1);
      const thumbnails = [];

      for (let i = 1; i <= count; i++) {
        const timestamp = interval * i;
        const filename = `thumb-${crypto.randomUUID()}.jpg`;
        const outputPath = path.join(outputDir, filename);

        await new Promise((res, rej) => {
          ffmpeg(inputPath)
            .screenshots({
              timestamps: [timestamp],
              filename: filename,
              folder: outputDir,
              size: "640x360",
            })
            .on("end", res)
            .on("error", rej);
        });

        thumbnails.push(outputPath);
      }

      resolve(thumbnails);
    } catch (err) {
      reject(err);
    }
  });
};

const generateMultipleQualities = async (inputPath, outputDir) => {
  const metadata = await getVideoMetadata(inputPath);
  const inputHeight = metadata.height;
  
  const qualitiesToGenerate = Object.keys(QUALITY_PRESETS).filter(
    quality => QUALITY_PRESETS[quality].height <= inputHeight
  );

  const results = {};

  for (const quality of qualitiesToGenerate) {
    const filename = `${crypto.randomUUID()}-${quality}.mp4`;
    const outputPath = path.join(outputDir, filename);
    
    await compressVideo(inputPath, outputPath, quality);
    results[quality] = outputPath;
  }

  return results;
};

module.exports = {
  getVideoMetadata,
  compressVideo,
  generateThumbnails,
  generateMultipleQualities,
};
