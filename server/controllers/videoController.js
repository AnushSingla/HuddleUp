const Video = require("../models/Video");
const { deleteCachePattern } = require("../utils/cache");
const { invalidateQueryCache } = require("../utils/queryCache");
const { addVideoToQueue } = require("../services/videoQueue");
const path = require("path");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

exports.createVideo = ResponseHandler.asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    logger.warn('Video creation failed - user not authenticated', {
      method: req.method,
      url: req.url,
      ip: req.ip
    });
    return ResponseHandler.unauthorized(res);
  }

  const { title, description, category } = req.body;
  if (!req.file) {
    logger.warn('Video creation failed - no file uploaded', {
      userId: req.user.id,
      title,
      category
    });
    return ResponseHandler.error(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      'No video file uploaded',
      400
    );
  }

  logger.info('Video upload started', {
    userId: req.user.id,
    title,
    category,
    filename: req.file.filename,
    fileSize: req.file.size
  });

  const videoUrl = `/uploads/${req.file.filename}`;
  const inputPath = path.join(__dirname, "..", "uploads", req.file.filename);

  const newVideo = new Video({
    title,
    description,
    category,
    videoUrl,
    postedBy: req.user.id,
    processingStatus: "pending",
    processingProgress: 0,
  });

  await newVideo.save();

  const jobId = await addVideoToQueue(newVideo._id.toString(), inputPath, req.user.id);
  
  await Video.findByIdAndUpdate(newVideo._id, {
    jobId,
    processingStatus: "processing",
  });

  await Promise.all([
    deleteCachePattern("feed:*"),
    invalidateQueryCache("video:*"),
  ]);

  logger.info('Video uploaded successfully', {
    videoId: newVideo._id,
    userId: req.user.id,
    title: newVideo.title,
    jobId
  });

  return ResponseHandler.success(res, {
    video: newVideo,
    jobId,
  }, "Video uploaded and processing started", 201);
});

exports.getAllVideos = async (req, res) => {
  try {
    const filter = {};
    if (req.query.postedBy) filter.postedBy = req.query.postedBy;
    const sortParam = (req.query.sort || "newest").toLowerCase();

    // sort=likes requires aggregation to sort by likes array length
    if (sortParam === "likes") {
      const pipeline = [
        { $match: filter },
        { $addFields: { likesCount: { $size: { $ifNull: ["$likes", []] } } } },
        { $sort: { likesCount: -1 } },
        { $lookup: { from: "users", localField: "postedBy", foreignField: "_id", as: "postedByDoc" } },
        { $unwind: { path: "$postedByDoc", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            postedBy: {
              _id: "$postedByDoc._id",
              username: "$postedByDoc.username",
            },
          },
        },
        { $project: { postedByDoc: 0 } },
      ];
      const videos = await Video.aggregate(pipeline);
      return res.status(200).json(videos);
    }

    let sortOption = { createdAt: -1 };
    if (sortParam === "views") sortOption = { views: -1 };
    // default "newest" or any other value: sort by createdAt desc

    const videos = await Video.find(filter)
      .populate("postedBy", "username _id")
      .sort(sortOption);
    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching videos" });
  }
};

exports.deleteVideo = ResponseHandler.asyncHandler(async (req, res) => {
  const videoId = req.params.id;
  const userId = req.user.id;

  if (!userId) {
    return ResponseHandler.unauthorized(res);
  }

  const video = await Video.findById(videoId);

  if (!video) {
    logger.warn('Video deletion failed - video not found', {
      videoId,
      userId
    });
    return ResponseHandler.notFound(res, 'Video');
  }

  if (!video.postedBy || video.postedBy.toString() !== userId.toString()) {
    logger.warn('Video deletion failed - permission denied', {
      videoId,
      userId,
      videoOwnerId: video.postedBy
    });
    return ResponseHandler.forbidden(res, 'You can only delete your own videos');
  }

  await Video.findByIdAndDelete(videoId);
  await Promise.all([
    deleteCachePattern("feed:*"),
    invalidateQueryCache("video:*"),
  ]);

  logger.info('Video deleted successfully', {
    videoId,
    userId,
    title: video.title
  });

  return ResponseHandler.success(res, null, "Video deleted successfully");
});

// Update an existing video (only owner can edit metadata)
exports.updateVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;
    const { title, description, category } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.postedBy || video.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not Allowed To Edit" });
    }

    if (typeof title === "string") video.title = title;
    if (typeof description === "string") video.description = description;
    if (typeof category === "string") video.category = category;

    const updatedVideo = await video.save();
    const populatedVideo = await updatedVideo.populate("postedBy", "username _id");
    await Promise.all([
      deleteCachePattern("feed:*"),
      invalidateQueryCache("video:*"),
    ]);

    res.status(200).json({
      message: "Video updated successfully",
      video: populatedVideo,
    });
  } catch (err) {
    console.error('❌ updateVideo error:', err);
    res.status(500).json({ message: "Error updating video", error: err.message });
  }
};

exports.getProcessingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id).select(
      "processingStatus processingProgress processingError jobId"
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json({
      videoId: id,
      status: video.processingStatus,
      progress: video.processingProgress,
      error: video.processingError,
      jobId: video.jobId,
    });
  } catch (err) {
    console.error("Error fetching processing status:", err);
    res.status(500).json({ message: "Error fetching status", error: err.message });
  }
};
