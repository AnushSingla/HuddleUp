const express = require("express")
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const path = require('path');

// Load environment variables first
dotenv.config();

// Import logger early for environment validation
const logger = require("./utils/logger");

// Validate environment variables before starting the server
const { validateEnvironment } = require("./utils/validateEnv");
if (!validateEnvironment()) {
  logger.error('Server startup failed due to environment variable errors.');
  logger.error('Please fix the above issues and restart the server.');
  process.exit(1);
}
const { initRedis } = require("./config/redis");
const { setIO, emitFeedEvent } = require("./socketEmitter");
const { getContentRoom } = require("./socketRegistry");
const { initQueryMonitoring, queryPerformanceMiddleware } = require("./middleware/queryMonitor");
const { errorHandler, notFoundHandler } = require("./middleware/errorHandler");
const {
  apiLimiter,
  authLimiter,
  feedLimiter,
  videoUploadLimiter,
  searchLimiter,
  commentLimiter,
  postCreationLimiter,
  passwordResetLimiter,
  adminLimiter
} = require("./middleware/rateLimit");
const { apiLimiter: apiLimiterNew } = require("./middleware/rateLimiter");
const { videoQueue } = require("./services/videoQueue");
const authRoutes = require("./routes/auth")
const videoRoutes = require("./routes/video")
const commentRoutes = require("./routes/comment")
const notificationRoutes = require("./routes/notification");
const postRoutes = require("./routes/post")
const friendRoutes = require("./routes/friend")
const adminRoutes = require("./routes/admin")
const userRoutes = require("./routes/user")
const savedRoutes = require("./routes/saved")
const feedRoutes = require("./routes/feed")
const playlistRoutes = require("./routes/playlist")
const analyticsRoutes = require("./routes/analytics")
const moderationRoutes = require("./routes/moderation")
const userDeleteRoutes = require("./routes/userDelete")

// Initialize services after environment validation
initRedis();
initQueryMonitoring();

// Initialize cleanup scheduler
const CleanupScheduler = require("./services/cleanupScheduler");
CleanupScheduler.scheduleCleanup();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://huddle-up-beta.vercel.app", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

setIO(io);

// Socket connection count for monitoring
const getSocketConnectionCount = () => (io.sockets?.sockets?.size ?? 0);

io.on("connection", (socket) => {
  const count = getSocketConnectionCount();
  if (count % 50 === 0 || count <= 5) {
    logger.info(`[Socket] Client connected. Active connections: ${count}`);
  }

  socket.on("join_match", (matchId) => {
    socket.join(`match_${matchId}`);
  });

  socket.on("send_message", ({ matchId, user, text }) => {
    io.to(`match_${matchId}`).emit("receive_message", { user, text });
  });

  socket.on("join_content", ({ contentType, contentId }) => {
    const room = getContentRoom({
      videoId: contentType === "video" ? contentId : null,
      postId: contentType === "post" ? contentId : null,
    });
    if (room) {
      socket.join(room);
    }
  });

  socket.on("leave_content", ({ contentType, contentId }) => {
    const room = getContentRoom({
      videoId: contentType === "video" ? contentId : null,
      postId: contentType === "post" ? contentId : null,
    });
    if (room) {
      socket.leave(room);
    }
  });

  socket.on("join_feed", () => {
    socket.join("feed_room");
  });

  socket.on("leave_feed", () => {
    socket.leave("feed_room");
  });

  socket.on("disconnect", (reason) => {
    // Explicitly leave all rooms to release references
    const rooms = Array.from(socket.rooms || []);
    for (const room of rooms) {
      if (room !== socket.id) {
        socket.leave(room);
      }
    }
    socket.removeAllListeners();
    const remaining = getSocketConnectionCount();
    if (remaining % 50 === 0 || remaining <= 5) {
      logger.info(`[Socket] Client disconnected (${reason}). Active connections: ${remaining}`);
    }
  });

  socket.on("error", (err) => {
    logger.error("[Socket] Error:", { error: err?.message || err });
    socket.removeAllListeners();
  });
});

// CORS configuration from environment variables
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ["https://huddle-up-beta.vercel.app", "http://localhost:5173", "http://localhost:5174"];

app.use(cors({
  origin: corsOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// Parse cookies for authentication
app.use(cookieParser());

// Apply general rate limiting to all API routes
app.use("/api", apiLimiter);
app.use("/api", apiLimiterNew);

app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api", videoRoutes)
app.use("/api", commentRoutes)
app.use("/api", postRoutes)
app.use("/api", friendRoutes)
app.use("/api", userRoutes)
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/moderation", moderationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api", savedRoutes);
app.use("/api/user", userDeleteRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/api", (req, res) => {
  res.json({ message: "HuddleUp API", status: "ok", version: "1.0" });
});
app.get("/favicon.ico", (req, res) => res.status(204));

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    logger.info("Attempting to connect to MongoDB...");

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 50,
      minPoolSize: 10,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority',
      readPreference: 'secondaryPreferred',
      compressors: ['zlib'],
    });
    logger.info("✅ MongoDB connected successfully");
  } catch (error) {
    logger.error("❌ MongoDB connection error:", { error: error.message });
    if (error.name === 'MongoNetworkError') {
      logger.error("Network error - Check:");
      logger.error("1. Internet connection");
      logger.error("2. MongoDB Atlas Network Access (IP whitelist)");
      logger.error("3. Connection string format");
    }
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => server.listen(PORT, () => logger.info(`Server is running at port ${PORT} (with Socket.IO)`)))
  .catch(err => logger.error("Server startup error:", { error: err }))

// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  try {
    // Close Socket.IO first to disconnect all clients and release socket references
    if (io) {
      logger.info('Closing Socket.IO server...');
      await new Promise((resolve) => {
        io.close(() => {
          logger.info('✅ Socket.IO server closed');
          resolve();
        });
      });
    }

    // Close HTTP server
    logger.info('Closing HTTP server...');
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    logger.info('✅ HTTP server closed');

    // Close video queue
    if (videoQueue) {
      logger.info('Closing video queue...');
      await videoQueue.close();
      logger.info('✅ Video queue closed');
    }

    // Close Redis connection
    const { closeRedis } = require("./config/redis");
    logger.info('Closing Redis connection...');
    await closeRedis();
    logger.info('✅ Redis connection closed');

    // Close MongoDB connection
    logger.info('Closing MongoDB connection...');
    await mongoose.connection.close();
    logger.info('✅ MongoDB connection closed');

    logger.info('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error during graceful shutdown:', { error });
    process.exit(1);
  }
};

// Handle different shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // For nodemon

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  logger.error('❌ Uncaught Exception:', { error });
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('❌ Unhandled Rejection at:', { promise, reason });
  gracefulShutdown('UNHANDLED_REJECTION');
});

module.exports = { io, emitFeedEvent };
// emitFeedEvent is re-exported from socketEmitter for use in controllers
