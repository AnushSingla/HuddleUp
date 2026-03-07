const User = require("../models/User");
const mongoose = require("mongoose");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

exports.getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Use aggregation to get users with friend status in one query
    const usersWithStatus = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(currentUserId) } } },
      {
        $lookup: {
          from: 'users',
          let: { userId: '$_id' },
          pipeline: [
            { $match: { _id: new mongoose.Types.ObjectId(currentUserId) } },
            {
              $project: {
                isFriend: { $in: ['$$userId', '$friends'] },
                hasRequestFrom: { $in: ['$$userId', '$friendRequests'] },
                hasSentRequestTo: { $in: ['$$userId', '$sentRequests'] }
              }
            }
          ],
          as: 'friendStatus'
        }
      },
      { $unwind: { path: '$friendStatus', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          username: 1,
          isFriend: { $ifNull: ['$friendStatus.isFriend', false] },
          hasRequestFrom: { $ifNull: ['$friendStatus.hasRequestFrom', false] },
          hasSentRequestTo: { $ifNull: ['$friendStatus.hasSentRequestTo', false] }
        }
      }
    ]);

    res.json(usersWithStatus);
  } catch (err) {
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Failed to fetch users");
  }
};

exports.getFriends = async (req, res) => {
  try {
    // Replace this with real friend fetching logic from DB
    const userId = req.user.id;
    const user = await User.findById(userId).populate("friends");
    if (!user) return ResponseHandler.notFound(res, "User not found");

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
    if (!receiver || !sender) return ResponseHandler.notFound(res, "User not found");

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
    // Removed console.error - use logger instead
    return ResponseHandler.handleError(err, req, res, "Failed to send friend request");
  }
};



exports.getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("friendRequests", "username")
    res.json(user.friendRequests);
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to get friend requests");
  }
}

exports.getSentRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("sentRequests", "username");
    res.json(user.sentRequests);
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to get sent requests");
  }
};


exports.acceptFriendRequests = async (req, res) => {
  const userId = req.user.id;
  const requesterId = req.params.id;

  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) return ResponseHandler.notFound(res, "User not found");

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
    return ResponseHandler.handleError(err, req, res, "Failed to accept friend request");
  }
};

exports.declineFriendRequest = async (req, res) => {
  const userId = req.user.id;
  const requesterId = req.params.id;

  try {
    const user = await User.findById(userId);
    const requester = await User.findById(requesterId);
    if (!user || !requester) return ResponseHandler.notFound(res, "User not found");

    // Remove from receiver's (current user) request list
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);

    // Remove from sender's sentRequests list
    requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

    await user.save();
    await requester.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    return ResponseHandler.handleError(err, req, res, "Failed to decline friend request");
  }
};
