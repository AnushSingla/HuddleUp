const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require('path');
const authRoutes = require("./routes/auth")
const videoRoutes = require("./routes/video")
const commentRoutes = require("./routes/comment")
const notificationRoutes = require("./routes/notification");
const postRoutes = require("./routes/post")
const friendRoutes = require("./routes/friend")
const userRoutes = require("./routes/user")

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://huddle-up-beta.vercel.app", "http://localhost:5173", "http://localhost:5174"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));





app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api", videoRoutes)
app.use("/api", commentRoutes)
app.use("/api", postRoutes)
app.use("/api", friendRoutes)
app.use("/api", userRoutes)
app.use("/api/notifications", notificationRoutes);
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
  .then(() => app.listen(5000, () => console.log("Server is running at port 5000")))
  .catch(err => console.log(err))
