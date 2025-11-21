const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema({
    videoId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Video',
      required:false,
    },
    postId: {
       type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
       default: null,
        required:false,
    },
    userId:{
         type:mongoose.Schema.Types.ObjectId,
         ref:'User',
         required:true
    },
    text:{
        type:String,
        required:true
    },
    parentId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comment',
         default: null,
    },
    likes : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]
},{timestamps:true});

module.exports = mongoose.model("Comment",CommentSchema)