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
}, { timestamps: true })

module.exports= mongoose.model("User",UserSchema)