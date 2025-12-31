import User from "../models/user.model.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";

// Load .env from the backend root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const seedAI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB for Seeding...");

        const email = "ai@bot.com";
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            console.log("AI Bot not found. Creating...");
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("ai-secret-key-123", salt);

            const aiUser = new User({
                fullName: "AI Assistant",
                email: email,
                password: hashedPassword,
                profilePic: "https://api.dicebear.com/9.x/bottts/svg?seed=AIAssistant&backgroundColor=b6e3f4&primaryColor=0ea5e9", // Modern AI robot avatar
            });

            await aiUser.save();
            console.log("✅ AI Assistant Created Successfully!");
        } else {
            console.log("ℹ️ AI Assistant already exists.");
            // Update profile pic
             existingUser.profilePic = "https://api.dicebear.com/9.x/bottts/svg?seed=AIAssistant&backgroundColor=b6e3f4&primaryColor=0ea5e9";
             await existingUser.save();
             console.log("ℹ️ AI Assistant avatar updated.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Seeding Error:", error);
        process.exit(1);
    }
};

seedAI();
