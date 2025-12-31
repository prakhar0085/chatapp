import { Server } from "socket.io";
import http from "http";
import express from "express";
import { createClient } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// Redis Setup for Scalability (Pub/Sub)
const pubClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
const subClient = pubClient.duplicate();

pubClient.on("error", (err) => console.error("Redis Pub Error:", err));
subClient.on("error", (err) => console.error("Redis Sub Error:", err));

// Initialize Redis and Adapter
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Redis Adapter Connected for multiple instances");
  })
  .catch((err) => {
    console.warn("⚠️ Redis Connection Failed. Running in single-instance mode.", err);
  });

io.on("connection", async (socket) => {
  console.log("A user connected", socket.id);
  const userId = socket.handshake.query.userId;

  if (userId) {
    // 1. Join User to their own room (for private messaging scaling)
    socket.join(userId);

    // 2. Add to Online Users (Global State in Redis)
    if (pubClient.isOpen) {
      await pubClient.sAdd("online_users", userId);
      
      // Broadcast updated online list to everyone
      const onlineUsers = await pubClient.sMembers("online_users");
      io.emit("getOnlineUsers", onlineUsers);
    }
  }

  // Typing Indicators
  socket.on("typing", ({ receiverId }) => {
    io.to(receiverId).emit("userTyping", { senderId: userId });
  });

  socket.on("stopTyping", ({ receiverId }) => {
    io.to(receiverId).emit("userStoppedTyping", { senderId: userId });
  });

  socket.on("disconnect", async () => {
    console.log("A user disconnected", socket.id);
    if (userId && pubClient.isOpen) {
        // Check if user has other active connections (tabs)
        const sockets = await io.in(userId).fetchSockets();
        if (sockets.length === 0) {
             // Use sRem to remove the user
             await pubClient.sRem("online_users", userId);
             const onlineUsers = await pubClient.sMembers("online_users");
             io.emit("getOnlineUsers", onlineUsers);
        }
    }
  });

  // WebRTC Signaling Events
  socket.on("callUser", (data) => {
    // Emit purely to the target user's room
    io.to(data.userToCall).emit("callUser", { 
        signal: data.signalData, 
        from: data.from, 
        name: data.name,
        profilePic: data.profilePic
      });
  });

  socket.on("answerCall", (data) => {
    io.to(data.to).emit("callAccepted", data.signal);
  });
});

export { io, app, server };
