const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId.toString(), targetUserId.toString()].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected: " + socket.id);

    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      if (!userId || !targetUserId) {
        return;
      }
      const roomId = getSecretRoomId(userId, targetUserId);
      socket.join(roomId);
      console.log(`${firstName || "User"} joined Room: ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {
        try {
          if (!userId || !targetUserId || !text || !text.trim()) {
            return;
          }

          const roomId = getSecretRoomId(userId, targetUserId);

          // Verify that userId & targetUserId are connected
          const isConnected = await ConnectionRequest.findOne({
            $or: [
              { fromUserId: userId, toUserId: targetUserId, status: "accepted" },
              { fromUserId: targetUserId, toUserId: userId, status: "accepted" },
            ],
          });

          if (!isConnected) {
            socket.emit("chatError", {
              message: "Cannot send message: You are not connected with this user",
            });
            return;
          }

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
            text: text.trim(),
          };

          chat.messages.push(newMessage);
          await chat.save();

          const messagePayload = {
            firstName,
            lastName,
            senderId: userId,
            text: text.trim(),
            createdAt: new Date().toISOString(),
          };

          io.to(roomId).emit("messageReceived", messagePayload);
        } catch (err) {
          console.error("Socket sendMessage error:", err);
          socket.emit("chatError", { message: "Failed to send message: " + err.message });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Socket disconnected: " + socket.id);
    });
  });

  return io;
};

module.exports = initializeSocket;
