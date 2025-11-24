const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
const path = require('path');
const authRoutes = require("./routes/auth")
const videoRoutes = require("./routes/video")
const commentRoutes = require("./routes/comment")
const postRoutes = require("./routes/post")
const friendRoutes = require("./routes/friend")

dotenv.config();
const app = express();

app.use(cors({
  origin: ["https://huddle-up-beta.vercel.app/","http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));





app.use(express.json());
app.use("/api/auth",authRoutes)
app.use("/api",videoRoutes)
app.use("/api",commentRoutes)
app.use("/api",postRoutes)
app.use("/api",friendRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/favicon.ico", (req, res) => res.status(204));

mongoose.connect(process.env.MONGO_URL)
.then(()=>app.listen(5000,()=>console.log("Server is running at port 5000")))
.catch(err=>console.log(err))