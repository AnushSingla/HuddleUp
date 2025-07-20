const Video = require("../models/Video");

exports.createVideo = async(req,res)=>{
    try{
        console.log("File:", req.file);
        console.log("Body:", req.body);

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
        res.status(500).json(err.message)
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
    const videoId = req.params.id; // ✅ Fix here
    const userId = req.user.id;

    const video = await Video.findById(videoId);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    if (!video.postedBy || video.postedBy.toString() !== userId) {
      return res.status(403).json({ message: "Not Allowed To Delete" });
    }

    await Video.findByIdAndDelete(videoId);

    res.status(200).json({ message: "Video deleted" });

  } catch (err) {
    console.error('❌ deleteVideo error:', err);
    res.status(500).json({ message: "Error deleting video" });
  }
};
