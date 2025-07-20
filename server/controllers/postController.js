const Post = require("../models/Post")
exports.createPost = async(req,res)=>{
    try{
        const {title,content,category} = req.body;
        
        const newPost = new Post({
            title,
            content,
            category,
            postedBy:req.userid
        });
        const savedPost = await newPost.save();
        const populatedPost = await savedPost.populate("postedBy", "username");
         res.status(201).json(savedPost);
    }catch(err){
        res.status(500).json({message:"Failed to create Post", error: err.message})
    }
}

exports.getAllPosts = async(req,res)=>{
    try{
        const posts = await Post.find().populate("postedBy","username").sort({createdAt:-1});
        res.json(posts)
    }catch(err){
         res.status(500).json({message:"Failed to fetch Post", error: err.message})
    }
}


exports.likePost = async(req,res)=>{
    try {
    const postId = req.params.id;
    const userId = req.user.id; // coming from verifyToken

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const liked = post.likes.includes(userId);

    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      likedByUser: !liked,
      likesCount: post.likes.length,
    });
  } catch (err) {
    res.status(500).json({ message: "Error toggling like", error: err.message });
  }
}

exports.deletePost = async(req,res)=>{
    try{
        const {id} = req.params.id;
        const userId = req.user.id
        const post = await Post.findById(id);
        if(!post) return res.status(404).json({message:"Post not found"})
        if (post.user.toString() !== userId) return res.status(403).json({message:"Not Allowed To Delete"})
        await post.remove();
        res.status(200).json({ message: "Post deleted" });
        
    }catch(err){
        console.error(err);
        res.status(500).json({ message: "Error fetching posts" });
    }
}