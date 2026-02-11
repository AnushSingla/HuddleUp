const Video = require("../models/Video");

exports.createVideo = async(req,res)=>{
    try{
        console.log("File:", req.file);
        console.log("Body:", req.body);

        if (!req.user || !req.user.id) {
          return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        const {title,description,category} = req.body;
        if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
         }

        const videoUrl = `/uploads/${req.file.filename}`;
        const newVideo = new Video({
        title,
        description,
        category,
        videoUrl,
        postedBy:req.user.id,
    });
    await newVideo.save();
    res.status(201).json({message: "Video Uploaded Successfully",video:newVideo});

    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: "Error uploading video", error: err.message })
    }
  
}

exports.getAllVideos = async(req,res)=>{
    try{
        const videos = await Video.find().populate("postedBy","username _id").sort({createdAt:-1})
        res.status(200).json(videos);

    }
    catch(err){
        console.error(err);
        res.status(500).json({ message: "Error fetching videos" });
    }
}

exports.deleteVideo = async (req, res) => {
  try {
    const videoId = req.params.id;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not authenticated" });
    }

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.postedBy || video.postedBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not Allowed To Delete" });
    }

    await Video.findByIdAndDelete(videoId);

    res.status(200).json({ message: "Video deleted" });

  } catch (err) {
    console.error('❌ deleteVideo error:', err);
    res.status(500).json({ message: "Error deleting video", error: err.message });
  }
};

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

    res.status(200).json({
      message: "Video updated successfully",
      video: populatedVideo,
    });
  } catch (err) {
    console.error('❌ updateVideo error:', err);
    res.status(500).json({ message: "Error updating video", error: err.message });
  }
};
