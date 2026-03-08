const User = require("../models/User");
const mongoose = require("mongoose");
const PaginationHelper = require("../utils/paginationHelper");
const logger = require("../utils/logger");
const { ResponseHandler, ERROR_CODES } = require("../utils/responseHandler");

exports.getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    // Use aggregation to get users with friend status in one query (N+1 optimization + pagination)
    const pipeline = [
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
      },
      { $sort: { username: 1 } },
      { $skip: skip },
      { $limit: limitNum }
    ];

    const [users, total] = await Promise.all([
      User.aggregate(pipeline),
      User.countDocuments({ _id: { $ne: currentUserId } })
    ]);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNext: pageNum * limitNum < total,
        hasPrev: pageNum > 1
      }
    });
    const paginationParams = PaginationHelper.getPaginationParams(req.query);
    
    const result = await PaginationHelper.executePaginatedQuery(
      User,
      { _id: { $ne: req.user.id } },
      {
        select: 'username',
        sort: { username: 1 }
      },
      paginationParams
    );
    
    res.json(result);
  } catch (err) {
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


const TransactionHelper = require("../utils/transactionHelper");

exports.sendFriendRequest = async (req, res) => {
  const toId = req.params.id;
  const fromId = req.user.id;

  try {
    if (fromId === toId) return res.status(400).json({ message: "Can't send request to yourself" });

    // Use transaction to ensure atomicity
    await TransactionHelper.withTransactionIfSupported(async (session) => {
      const sessionOpt = session ? { session } : {};

      const receiver = await User.findById(toId, null, sessionOpt);
      const sender = await User.findById(fromId, null, sessionOpt);
      if (!receiver || !sender) {
        throw new Error("User not found");
      }

      if (receiver.friendRequests.includes(fromId)) {
        throw new Error("Friend request already sent");
      }

      // Add request to receiver
      receiver.friendRequests.push(fromId);
      await receiver.save(sessionOpt);

      // Add to sender's sentRequests
      sender.sentRequests.push(toId);
      await sender.save(sessionOpt);
    });

    res.status(200).json({ message: "Friend request sent" });
  } catch (err) {
    if (err.message === "User not found") {
      return ResponseHandler.notFound(res, "User not found");
    }
    if (err.message === "Friend request already sent") {
      return res.status(400).json({ message: err.message });
    }
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
    // Use transaction to ensure atomicity
    await TransactionHelper.withTransactionIfSupported(async (session) => {
      const sessionOpt = session ? { session } : {};

      const user = await User.findById(userId, null, sessionOpt);
      const requester = await User.findById(requesterId, null, sessionOpt);
      if (!user || !requester) {
        throw new Error("User not found");
      }

      if (!user.friendRequests.includes(requesterId)) {
        throw new Error("No such friend request");
      }

      // Add each other as friends
      user.friends.push(requesterId);
      requester.friends.push(userId);

      // Remove from receiver's request list
      user.friendRequests = user.friendRequests.filter(id => id.toString() !== requesterId);

      // Remove from sender's sentRequests list
      requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== userId);

      await user.save(sessionOpt);
      await requester.save(sessionOpt);
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    if (err.message === "User not found") {
      return ResponseHandler.notFound(res, "User not found");
    }
    if (err.message === "No such friend request") {
      return res.status(400).json({ message: err.message });
    }
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
