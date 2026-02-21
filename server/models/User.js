const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    friends:[{
     type:mongoose.Schema.Types.ObjectId,
     ref:"User"
    }],
     friendRequests:[{
     type:mongoose.Schema.Types.ObjectId,
     ref:"User"
    }],
     sentRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bio: {
        type: String,
        default: ""
    },
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    isAdmin: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true })

module.exports= mongoose.model("User",UserSchema)