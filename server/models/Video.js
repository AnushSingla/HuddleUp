const mongoose = require("mongoose")

const VideoSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    description:String,
    category: {
      type: String,
      required: true,
    },
    videoUrl:{
        type:String,
        required:true, 
    },
    postedBy:{
         type: mongoose.Schema.Types.ObjectId,
         ref: "User",
    },
    createdAt:{
        type:Date,
        default: Date.now,
    },
      uploadDate: {
    type: Date,
    default: Date.now // ✅ This sets the current date when video is created
  },
    likes: [{
     type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    }],
    views:{
     type:Number,
     default:0
    }
})

module.exports= mongoose.model("Video",VideoSchema)