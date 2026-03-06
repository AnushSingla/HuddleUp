const Report = require("../models/Report");
const ModerationLog = require("../models/ModerationLog");
const Appeal = require("../models/Appeal");
const Post = require("../models/Post");
const Video = require("../models/Video");
const Comment = require("../models/Comment");
const User = require("../models/User");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

// ─── Helper: Get content model by type ───────────────────────────────────────

const getContentModel = (contentType) => {
    switch (contentType) {
        case "post": return Post;
        case "video": return Video;
        case "comment": return Comment;
        default: return null;
    }
};

const getContentPopulate = (contentType) => {
    switch (contentType) {
        case "post": return { path: "postedBy", select: "username email" };
        case "video": return { path: "postedBy", select: "username email" };
        case "comment": return { path: "userId", select: "username email" };
        default: return null;
    }
};

// ─── Create Report ───────────────────────────────────────────────────────────

exports.createReport = async (req, res) => {
    try {
        const { contentType, contentId, reason, description } = req.body;
        const reportedBy = req.user.id;

        // Validate content exists
        const Model = getContentModel(contentType);
        if (!Model) {
            return res.status(400).json({ message: "Invalid content type" });
        }

        const content = await Model.findById(contentId);
        if (!content) {
            return res.status(404).json({ message: `${contentType} not found` });
        }

        // Prevent duplicate reports from same user on same content
        const existingReport = await Report.findOne({
            reportedBy,
            contentType,
            contentId,
            status: { $in: ["pending", "reviewing"] }
        });

        if (existingReport) {
            return res.status(409).json({ message: "You have already reported this content" });
        }

        // Calculate priority based on total report count for this content
        const reportCount = await Report.countDocuments({ contentType, contentId });
        let priority = "low";
        if (reportCount >= 10) priority = "critical";
        else if (reportCount >= 5) priority = "high";
        else if (reportCount >= 2) priority = "medium";

        // Build content snapshot
        const contentSnapshot = {
            title: content.title || "",
            content: content.content || content.text || content.description || "",
            author: content.postedBy?.toString() || content.userId?.toString() || ""
        };

        const report = await Report.create({
            reportedBy,
            contentType,
            contentId,
            reason,
            description: description || "",
            priority,
            contentSnapshot
        });

        // Also flag the content on the original model
        if (!content.flaggedBy?.includes(reportedBy)) {
            content.flaggedBy = content.flaggedBy || [];
            content.flaggedBy.push(reportedBy);
        }
        content.flagged = true;
        content.flagReason = reason;
        await content.save();

        res.status(201).json({ message: "Report submitted successfully", report });
    } catch (error) {
        res.status(500).json({ message: "Error creating report", error: error.message });
    }
};

// ─── Get Report Queue ────────────────────────────────────────────────────────

exports.getReportQueue = async (req, res) => {
    try {
        const {
            status = "pending",
            contentType,
            priority,
            page = 1,
            limit = 20,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        const filter = {};
        if (status && status !== "all") filter.status = status;
        if (contentType) filter.contentType = contentType;
        if (priority) filter.priority = priority;

        const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [reports, total] = await Promise.all([
            Report.find(filter)
                .populate("reportedBy", "username email")
                .populate("assignedTo", "username")
                .populate("resolvedBy", "username")
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Report.countDocuments(filter)
        ]);

        res.json({
            reports,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching report queue", error: error.message });
    }
};

// ─── Get Single Report ───────────────────────────────────────────────────────

exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("reportedBy", "username email")
            .populate("assignedTo", "username")
            .populate("resolvedBy", "username");

        if (!report) {
            return ResponseHandler.notFound(res, "Report not found");
        }

        // Populate the actual content
        const Model = getContentModel(report.contentType);
        const populateField = getContentPopulate(report.contentType);
        let content = null;

        if (Model) {
            content = await Model.findById(report.contentId)
                .populate(populateField)
                .lean();
        }

        res.json({ report, content });
    } catch (error) {
        res.status(500).json({ message: "Error fetching report", error: error.message });
    }
};

// ─── Resolve Report ──────────────────────────────────────────────────────────

exports.resolveReport = async (req, res) => {
    try {
        const { resolution, reason } = req.body;
        const moderatorId = req.user.id;

        const report = await Report.findById(req.params.id);
        if (!report) {
            return ResponseHandler.notFound(res, "Report not found");
        }

        if (report.status === "resolved" || report.status === "dismissed") {
            return res.status(400).json({ message: "Report already resolved" });
        }

        // Take action based on resolution
        const Model = getContentModel(report.contentType);
        const content = Model ? await Model.findById(report.contentId) : null;

        if (resolution === "deleted" && content) {
            await Model.findByIdAndDelete(report.contentId);
            // Delete associated comments if post/video
            if (report.contentType === "post") {
                await Comment.deleteMany({ postId: report.contentId });
            } else if (report.contentType === "video") {
                await Comment.deleteMany({ videoId: report.contentId });
            }
        } else if (resolution === "approved" && content) {
            // Content is fine, remove flag
            content.flagged = false;
            content.flaggedBy = [];
            content.flagReason = "";
            await content.save();
        } else if (resolution === "warned" && content) {
            // Content stays but user gets a warning
            const authorId = content.postedBy || content.userId;
            if (authorId) {
                await User.findByIdAndUpdate(authorId, {
                    $push: {
                        warnings: {
                            reason: reason || report.reason,
                            issuedBy: moderatorId,
                            issuedAt: new Date()
                        }
                    }
                });
            }
        } else if (resolution === "rejected" && content) {
            // Dismiss the report, content stays
            content.flagged = false;
            content.flaggedBy = [];
            content.flagReason = "";
            await content.save();
        }

        // Update report status
        report.status = resolution === "rejected" ? "dismissed" : "resolved";
        report.resolution = resolution;
        report.resolvedBy = moderatorId;
        report.resolvedAt = new Date();
        await report.save();

        // Also resolve any duplicate reports for the same content
        await Report.updateMany(
            {
                contentType: report.contentType,
                contentId: report.contentId,
                _id: { $ne: report._id },
                status: { $in: ["pending", "reviewing"] }
            },
            {
                status: report.status,
                resolution,
                resolvedBy: moderatorId,
                resolvedAt: new Date()
            }
        );

        // Log the moderation action
        await ModerationLog.create({
            moderator: moderatorId,
            action: resolution === "deleted" ? "delete" :
                resolution === "approved" ? "approve" :
                    resolution === "warned" ? "warn" : "reject",
            targetType: report.contentType,
            targetId: report.contentId,
            reason: reason || report.reason,
            details: {
                reportId: report._id,
                contentSnapshot: report.contentSnapshot
            }
        });

        res.json({ message: `Report ${resolution} successfully` });
    } catch (error) {
        res.status(500).json({ message: "Error resolving report", error: error.message });
    }
};

// ─── Get Moderation Logs ─────────────────────────────────────────────────────

exports.getModerationLogs = async (req, res) => {
    try {
        const {
            action,
            moderator,
            page = 1,
            limit = 20
        } = req.query;

        const filter = {};
        if (action) filter.action = action;
        if (moderator) filter.moderator = moderator;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [logs, total] = await Promise.all([
            ModerationLog.find(filter)
                .populate("moderator", "username email")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            ModerationLog.countDocuments(filter)
        ]);

        res.json({
            logs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching moderation logs", error: error.message });
    }
};

// ─── Get Reports For A User ──────────────────────────────────────────────────

exports.getUserReports = async (req, res) => {
    try {
        const { userId } = req.params;

        const reports = await Report.find({
            $or: [
                { reportedBy: userId },
                { "contentSnapshot.author": userId }
            ]
        })
            .populate("reportedBy", "username")
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user reports", error: error.message });
    }
};

// ─── Submit Appeal ───────────────────────────────────────────────────────────

exports.submitAppeal = async (req, res) => {
    try {
        const userId = req.user.id;
        const { reason } = req.body;

        const user = await User.findById(userId);
        if (!user || !user.isBanned) {
            return res.status(400).json({ message: "You are not banned. No appeal needed." });
        }

        // Check for existing pending appeal
        const existingAppeal = await Appeal.findOne({
            userId,
            status: "pending"
        });

        if (existingAppeal) {
            return res.status(409).json({ message: "You already have a pending appeal" });
        }

        const appeal = await Appeal.create({
            userId,
            reason
        });

        res.status(201).json({ message: "Appeal submitted successfully", appeal });
    } catch (error) {
        res.status(500).json({ message: "Error submitting appeal", error: error.message });
    }
};

// ─── Get Appeals ─────────────────────────────────────────────────────────────

exports.getAppeals = async (req, res) => {
    try {
        const { status = "pending", page = 1, limit = 20 } = req.query;

        const filter = {};
        if (status && status !== "all") filter.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [appeals, total] = await Promise.all([
            Appeal.find(filter)
                .populate("userId", "username email isBanned banReason bannedAt bannedUntil")
                .populate("reviewedBy", "username")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .lean(),
            Appeal.countDocuments(filter)
        ]);

        res.json({
            appeals,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching appeals", error: error.message });
    }
};

// ─── Resolve Appeal ──────────────────────────────────────────────────────────

exports.resolveAppeal = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const reviewerId = req.user.id;

        const appeal = await Appeal.findById(req.params.id);
        if (!appeal) {
            return ResponseHandler.notFound(res, "Appeal not found");
        }

        if (appeal.status !== "pending") {
            return res.status(400).json({ message: "Appeal already resolved" });
        }

        appeal.status = status;
        appeal.reviewedBy = reviewerId;
        appeal.reviewedAt = new Date();
        appeal.adminNotes = adminNotes || "";
        await appeal.save();

        // If approved, unban the user
        if (status === "approved") {
            await User.findByIdAndUpdate(appeal.userId, {
                isBanned: false,
                banReason: "",
                bannedAt: null,
                bannedUntil: null
            });
        }

        // Log the action
        await ModerationLog.create({
            moderator: reviewerId,
            action: "resolve_appeal",
            targetType: "user",
            targetId: appeal.userId,
            reason: adminNotes || `Appeal ${status}`,
            details: { appealId: appeal._id, resolution: status }
        });

        res.json({ message: `Appeal ${status} successfully` });
    } catch (error) {
        res.status(500).json({ message: "Error resolving appeal", error: error.message });
    }
};

// ─── Get Moderation Stats ────────────────────────────────────────────────────

exports.getModerationStats = async (req, res) => {
    try {
        const [
            pendingReports,
            totalReports,
            resolvedToday,
            pendingAppeals,
            bannedUsers,
            totalLogs
        ] = await Promise.all([
            Report.countDocuments({ status: "pending" }),
            Report.countDocuments(),
            Report.countDocuments({
                resolvedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
            }),
            Appeal.countDocuments({ status: "pending" }),
            User.countDocuments({ isBanned: true }),
            ModerationLog.countDocuments()
        ]);

        res.json({
            pendingReports,
            totalReports,
            resolvedToday,
            pendingAppeals,
            bannedUsers,
            totalLogs
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching moderation stats", error: error.message });
    }
};
