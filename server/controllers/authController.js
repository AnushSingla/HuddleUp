const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async(req,res)=>{
    console.log("Received register request:", req.body);
    try{
        const {username,email,password} = req.body;
        const hashed = await bcrypt.hash(password,10);
        const newUser = new User({username,email,password:hashed});
        await newUser.save();
         console.log("User saved:", newUser);

         res.status(201).json("User registered");
    }catch(err){
        console.log("Error in register:", err);
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            return res.status(400).json(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
        }
        res.status(500).json(err.message || "Internal Server Error")
    }
}


exports.login = async(req,res)=>{
    try{
        const {email,password} = req.body;
        const user = await User.findOne({email})
        if(!user){
            return(
                res.status(404).json("User not Found")
            )
        }
        const valid = await bcrypt.compare(password,user.password)
        if(!valid){
            return(
                res.status(401).json("Password Incorrect")
            )
        }
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1d"});
        res.json({user:{username:user.username,email:user.email},token})
    }catch(err){
         res.status(500).json(err.message);
    }
}