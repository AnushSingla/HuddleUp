const express = require("express")
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require('path');
const { initRedis } = require("./config/redis");
const { apiLimiter, authLimiter } = require("./middleware/rateLimit");
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

dotenv.config();
initRedis();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["https://huddle-up-beta.vercel.app", "http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  socket.on("join_match", (matchId) => {
    socket.join(`match_${matchId}`);
  });

  socket.on("send_message", ({ matchId, user, text }) => {
    io.to(`match_${matchId}`).emit("receive_message", { user, text });
  });

  socket.on("join_feed", () => {
    socket.join("feed_room");
  });

  socket.on("leave_feed", () => {
    socket.leave("feed_room");
  });

  socket.on("disconnect", () => { });
});

const emitFeedEvent = (event, data) => {
  io.to("feed_room").emit(event, data);
};

app.use(cors({
  origin: ["https://huddle-up-beta.vercel.app", "http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", authLimiter, authRoutes)
app.use("/api", apiLimiter, videoRoutes)
app.use("/api", apiLimiter, commentRoutes)
app.use("/api", apiLimiter, postRoutes)
app.use("/api", apiLimiter, friendRoutes)
app.use("/api", apiLimiter, userRoutes)
app.use("/api", apiLimiter, savedRoutes)
app.use("/api/notifications", apiLimiter, notificationRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/feed", feedRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/api", (req, res) => {
  res.json({ message: "HuddleUp API", status: "ok", version: "1.0" });
});
app.get("/favicon.ico", (req, res) => res.status(204));

const connectDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    console.log("Attempting to connect to MongoDB...");

    await mongoose.connect(mongoUrl, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority',
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    if (error.name === 'MongoNetworkError') {
      console.error("Network error - Check:");
      console.error("1. Internet connection");
      console.error("2. MongoDB Atlas Network Access (IP whitelist)");
      console.error("3. Connection string format");
    }
    process.exit(1);
  }
};

connectDB()
  .then(() => server.listen(5000, () => console.log("Server is running at port 5000 (with Socket.IO)")))
  .catch(err => console.log(err))

module.exports = { io, emitFeedEvent };
