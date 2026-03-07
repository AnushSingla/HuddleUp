const Video = require("../models/Video");
const { deleteCachePattern } = require("../utils/cache");
const { invalidateQueryCache } = require("../utils/queryCache");
const { addVideoToQueue } = require("../services/videoQueue");
const { detectDuplicates, getDuplicateStats } = require("../services/duplicateDetectionService");
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

  const { title, description, category, ignoreDuplicates } = req.body;
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

  try {
    // Perform duplicate detection
    const duplicateResult = await detectDuplicates(
      inputPath,
      {
        size: req.file.size,
        originalname: req.file.originalname
      },
      req.user.id,
      req.videoMetadata || {} // Use metadata from validation if available
    );

    // Handle exact duplicates
    if (duplicateResult.isDuplicate && duplicateResult.type === 'exact') {
      logger.warn('Exact duplicate detected, rejecting upload', {
        userId: req.user.id,
        filename: req.file.filename,
        duplicateVideoId: duplicateResult.duplicate._id
      });

      return ResponseHandler.error(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        duplicateResult.message,
        409,
        {
          duplicateType: 'exact',
          originalVideo: {
            id: duplicateResult.duplicate._id,
            title: duplicateResult.duplicate.title,
            uploadedBy: duplicateResult.duplicate.postedBy.username,
            uploadDate: duplicateResult.duplicate.createdAt
          }
        }
      );
    }

    // Handle potential duplicates
    if (duplicateResult.type === 'potential' && !ignoreDuplicates) {
      logger.info('Potential duplicates detected, requesting user confirmation', {
        userId: req.user.id,
        filename: req.file.filename,
        potentialCount: duplicateResult.potentialDuplicates.length
      });

      return ResponseHandler.error(
        res,
        ERROR_CODES.VALIDATION_ERROR,
        duplicateResult.message,
        409,
        {
          duplicateType: 'potential',
          potentialDuplicates: duplicateResult.potentialDuplicates.map(video => ({
            id: video._id,
            title: video.title,
            uploadedBy: video.postedBy.username,
            uploadDate: video.createdAt,
            duration: video.metadata?.duration,
            fileSize: video.metadata?.fileSize
          })),
          canProceed: true
        }
      );
    }

    // Enhanced metadata from validation
    const enhancedMetadata = {
      fileSize: req.file.size,
      originalFileName: req.file.originalname,
      ...(req.videoMetadata || {}),
      uploadValidation: {
        signatureValidated: true,
        metadataValidated: !!req.videoMetadata,
        securityScanned: !!req.securityAnalysis,
        uploadTimestamp: new Date()
      }
    };

    // Create video record with enhanced metadata
    const newVideo = new Video({
      title,
      description,
      category,
      videoUrl,
      postedBy: req.user.id,
      processingStatus: "pending",
      processingProgress: 0,
      fileHash: duplicateResult.fileHash,
      originalFileSize: req.file.size,
      originalFileName: req.file.originalname,
      metadata: enhancedMetadata
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

    logger.info('Video uploaded successfully with enhanced validation', {
      videoId: newVideo._id,
      userId: req.user.id,
      title: newVideo.title,
      jobId,
      fileHash: duplicateResult.fileHash,
      duplicateStatus: duplicateResult.type,
      metadata: req.videoMetadata ? 'validated' : 'pending',
      securityScan: req.securityAnalysis ? 'completed' : 'skipped'
    });

    return ResponseHandler.success(res, {
      video: newVideo,
      jobId,
      duplicateStatus: duplicateResult.type,
      validation: {
        fileValidated: true,
        metadataExtracted: !!req.videoMetadata,
        securityScanned: !!req.securityAnalysis
      }
    }, "Video uploaded and processing started", 201);

  } catch (error) {
    logger.error('Error during video upload with duplicate detection', {
      userId: req.user.id,
      filename: req.file.filename,
      error: error.message
    });

    return ResponseHandler.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      'Error processing video upload',
      500
    );
  }
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

const SoftDeleteService = require("../services/softDeleteService");
const TransactionHelper = require("../utils/transactionHelper");
const Comment = require("../models/Comment");
const VideoAnalytics = require("../models/VideoAnalytics");
const ViewLog = require("../models/ViewLog");

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

  // Use transaction to ensure atomicity
  await TransactionHelper.withTransactionIfSupported(async (session) => {
    const sessionOpt = session ? { session } : {};

    // Soft delete the video with enhanced service
    const systemInfo = {
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      apiVersion: '1.0'
    };

    await SoftDeleteService.softDelete(Video, videoId, userId, 'User deleted', { systemInfo, ...sessionOpt });
    
    // Delete related data in transaction
    await Promise.all([
      Comment.deleteMany({ videoId }, sessionOpt),
      VideoAnalytics.deleteOne({ video: videoId }, sessionOpt),
      ViewLog.deleteMany({ video: videoId }, sessionOpt)
    ]);
  });
  
  // Clear cache after successful transaction
  await Promise.all([
    deleteCachePattern("feed:*"),
    invalidateQueryCache("video:*"),
  ]);

  logger.info('Video deleted successfully with transaction', {
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

// Get duplicate detection statistics (admin only)
exports.getDuplicateStats = ResponseHandler.asyncHandler(async (req, res) => {
  try {
    const stats = await getDuplicateStats();
    
    logger.info('Duplicate stats requested', {
      userId: req.user.id,
      stats
    });

    return ResponseHandler.success(res, stats, "Duplicate statistics retrieved successfully");
  } catch (error) {
    logger.error('Error fetching duplicate stats', {
      userId: req.user.id,
      error: error.message
    });

    return ResponseHandler.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      'Error fetching duplicate statistics',
      500
    );
  }
});

// Get videos with duplicate hashes (admin only)
exports.getDuplicateGroups = ResponseHandler.asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Find duplicate groups
    const duplicateHashes = await Video.aggregate([
      { $match: { fileHash: { $exists: true, $ne: null } } },
      { $group: { 
          _id: '$fileHash', 
          videos: { $push: '$$ROOT' },
          count: { $sum: 1 } 
        } 
      },
      { $match: { count: { $gt: 1 } } },
      { $skip: skip },
      { $limit: parseInt(limit) }
    ]);

    // Populate user information
    for (let group of duplicateHashes) {
      for (let video of group.videos) {
        const user = await Video.populate(video, { path: 'postedBy', select: 'username' });
      }
    }

    const totalGroups = await Video.aggregate([
      { $match: { fileHash: { $exists: true, $ne: null } } },
      { $group: { _id: '$fileHash', count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $count: 'total' }
    ]);

    logger.info('Duplicate groups requested', {
      userId: req.user.id,
      page,
      limit,
      groupsFound: duplicateHashes.length
    });

    return ResponseHandler.success(res, {
      duplicateGroups: duplicateHashes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalGroups[0]?.total || 0,
        totalPages: Math.ceil((totalGroups[0]?.total || 0) / parseInt(limit))
      }
    }, "Duplicate groups retrieved successfully");

  } catch (error) {
    logger.error('Error fetching duplicate groups', {
      userId: req.user.id,
      error: error.message
    });

    return ResponseHandler.error(
      res,
      ERROR_CODES.INTERNAL_ERROR,
      'Error fetching duplicate groups',
      500
    );
  }
});
