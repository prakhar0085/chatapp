//Global import
import express from "express";
import dotenv from "dotenv";
import cookieparser from "cookie-parser";
import cors from "cors";

//Local import 
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import aiRoutes from "./routes/ai.routes.js";

import { app,server } from "./lib/socket.js";


import path from "path";

dotenv.config();

const PORT = process.env.PORT || 8080;
const __dirname = path.resolve();




app.use(express.json({ limit: "10mb" }));
app.use(cookieparser());
app.use(
    cors({
        origin: ["http://localhost:5173", "http://localhost:5174"],
        credentials: true,
       
    })
)


// Routes
app.use("/api/auth" , authRoutes);
app.use("/api/messages" , messageRoutes);
app.use("/api/ai", aiRoutes);

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
  
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
    });
  }

server.listen(PORT , ()=>{
    console.log(`Server is running on port ${PORT}`);
    connectDB();
})