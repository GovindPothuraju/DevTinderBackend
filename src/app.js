require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const initializeSocket = require("./utils/socket");
const { notFoundHandler, errorHandler } = require("./middlewares/errorHandler");

// Routers
const authRouter = require("./routers/auth");
const profileRouter = require("./routers/profile");
const requestRouter = require("./routers/request");
const userRouter = require("./routers/user");
const paymentRouter = require("./routers/payment");
const chatRouter = require("./routers/chat");

const app = express();

// Create HTTP server for Express and Socket.IO
const server = http.createServer(app);

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Body parsing and cookie parsing middlewares
app.use(express.json());
app.use(cookieParser());

// Initialize Socket.IO with HTTP server
initializeSocket(server);

// Register API Routers
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "DevTinder backend server is running smoothly",
    timestamp: new Date().toISOString(),
  });
});

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection & Server Startup
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err);
  });

module.exports = { app, server };
