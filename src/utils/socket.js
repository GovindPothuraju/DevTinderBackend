const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

/**
 * Generate a deterministic SHA-256 room ID for a pair of users.
 * Sorting the user IDs ensures both users always join the exact same room.
 */
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId.toString(), targetUserId.toString()].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow all frontend origins with credentials in dev and production
        callback(null, true);
      },
      credentials: true,
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    console.log("⚡ Socket client connected:", socket.id);

    // 1. Join Private 1-to-1 Chat Room
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      if (!userId || !targetUserId) {
        return;
      }
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`[Socket] ${firstName || "User"} (${userId}) joined room: ${roomId}`);
    });

    // 2. Real-time Send Message
    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }, ackCallback) => {
        try {
          if (!userId || !targetUserId || !text || !text.trim()) {
            if (typeof ackCallback === "function") {
              ackCallback({ success: false, error: "Invalid message payload" });
            }
            return;
          }

          const trimmedText = text.trim();
          const roomId = getSecretRoomId(userId, targetUserId);

          // Verify that userId & targetUserId have an accepted connection
          const isConnected = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
              { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
            ],
          });

          if (!isConnected) {
            socket.emit("chatError", {
              message: "Cannot send message: You are not connected with this developer",
            });
            if (typeof ackCallback === "function") {
              ackCallback({ success: false, error: "Not connected" });
            }
            return;
          }

          // Retrieve or create Chat document
          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          const newMessage = {
            senderId: userId,
            text: trimmedText,
          };

          chat.messages.push(newMessage);
          await chat.save();

          // Get the saved message with Mongoose generated _id and timestamp
          const savedMsg = chat.messages[chat.messages.length - 1];

          const messagePayload = {
            _id: savedMsg._id,
            senderId: userId,
            firstName: firstName || "",
            lastName: lastName || "",
            text: trimmedText,
            createdAt: savedMsg.createdAt || new Date().toISOString(),
          };

          // Broadcast to everyone in the secret room (including sender & recipient)
          io.to(roomId).emit("messageReceived", messagePayload);

          if (typeof ackCallback === "function") {
            ackCallback({ success: true, message: messagePayload });
          }
        } catch (err) {
          console.error("Socket sendMessage error:", err);
          socket.emit("chatError", {
            message: "Failed to send message: " + err.message,
          });
          if (typeof ackCallback === "function") {
            ackCallback({ success: false, error: err.message });
          }
        }
      }
    );

    // 3. Live Typing Indicator Events
    socket.on("typing", ({ userId, targetUserId, firstName }) => {
      if (!userId || !targetUserId) return;
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.to(roomId).emit("userTyping", { userId, firstName });
    });

    socket.on("stopTyping", ({ userId, targetUserId }) => {
      if (!userId || !targetUserId) return;
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.to(roomId).emit("userStoppedTyping", { userId });
    });

    // 4. Socket Disconnect
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

module.exports = initializeSocket;
