const express = require("express");
const mongoose = require("mongoose");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    // 1. Validate targetUserId format
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target user ID format",
      });
    }

    // 2. Prevent self-chat
    if (userId.toString() === targetUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot start a chat with yourself",
      });
    }

    // 3. Verify target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "Target user not found",
      });
    }

    // 4. Verify connection status (must be accepted connections)
    const isConnected = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
        { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
      ],
    });

    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: "You can only chat with accepted connections",
      });
    }

    // 5. Find or create chat document
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName photo",
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (err) {
    console.error("Fetch chat error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve chat messages: " + err.message,
    });
  }
});

module.exports = chatRouter;
