const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    console.log("🔒 Authenticated user ID:", req.user.id);

    const users = await User.find({ _id: { $ne: req.user.id } }).select("username");
    console.log("📦 Users fetched:", users.length);
    res.json(users);
  } catch (err) {
    console.error("🔥 Failed to fetch users:", err);
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    // Replace this with real friend fetching logic from DB
    const userId = req.user.id;
    const user = await User.findById(userId).populate("friends");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.sendFriendRequest = async (req, res) => {
  const toId = req.params.id;
  const fromId = req.user.id;

  try {
    if (fromId === toId) return res.status(400).json({ message: "Can't send request to yourself" });

    const receiver = await User.findById(toId);
    const sender = await User.findById(fromId);
    if (!receiver || !sender) return res.status(404).json({ message: "User not found" });

    if (receiver.friendRequests.includes(fromId)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Add request to receiver
    receiver.friendRequests.push(fromId);
    await receiver.save();

    // ✅ Also add to sender's sentRequests
    sender.sentRequests.push(toId);
    await sender.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    console.error("❌ Error sending request:", err);
    res.status(500).json({ message: "Failed to send friend request", error: err.message });
  }
};



exports.getFriendRequests = async(req,res)=>{
    try{
    const user = await User.findById(req.user.id).populate("friendRequests","username")
     res.json(user.friendRequests);
    }catch(err){
      res.status(500).json({ message: 'Failed to get friend requests', error: err.message });
}
}

exports.getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("sentRequests", "username");
    res.json(user.sentRequests);
  } catch (err) {
    res.status(500).json({ message: "Failed to get sent requests", error: err.message });
  }
};


exports.acceptFriendRequests = async (req, res) => {
  const userId = req.user.id;
  const requesterId = req.params.id;

  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) return res.status(404).json({ message: "User not found" });

    if (!user.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: "No such friend request" });
    }

    // Add each other as friends
    user.friends.push(requesterId);
    requester.friends.push(userId);

    // Remove from receiver's request list
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);

    // ✅ Remove from sender's sentRequests list
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to accept friend request", error: err.message });
  }
};
