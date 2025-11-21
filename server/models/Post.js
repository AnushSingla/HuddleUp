const mongoose = require("mongoose");
const postSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    postedBy:{
        type: mongoose.Schema.Types.ObjectId,
         ref: "User",
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    
    createdAt:{
        type:Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Post",postSchema)