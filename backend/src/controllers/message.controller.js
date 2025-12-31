import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    
    // Find the logged in user and populate their contacts
    const user = await User.findById(loggedInUserId).populate("contacts", "-password");
    
    // Always include the AI Bot if it exists
    const aiBot = await User.findOne({ email: "ai@bot.com" }).select("-password");
    
    const sidebarUsers = user.contacts || [];
    if (aiBot && !sidebarUsers.find(u => u._id.toString() === aiBot._id.toString())) {
        sidebarUsers.push(aiBot);
    }

    res.status(200).json(sidebarUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error in getMessages: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        resource_type: "video"
      });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
    });

    await newMessage.save();

    // Emit into the receiver's room
    io.to(receiverId).emit("newMessage", newMessage);
    res.status(200).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const myId = req.user._id;

    // Mark all unread messages from this sender to me as read
    await Message.updateMany(
      { senderId, receiverId: myId, isRead: false },
      { $set: { isRead: true } }
    );

    // Notify the sender that their messages were seen
    io.to(senderId).emit("messagesSeen", { seenBy: myId });

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markAsRead: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const connectByChatCode = async (req, res) => {
    try {
        const { chatCode } = req.body;
        const myId = req.user._id;

        if (!chatCode) {
            return res.status(400).json({ message: "Chat Code is required" });
        }

        // 1. Find the target user
        const targetUser = await User.findOne({ chatCode });
        if (!targetUser) {
            return res.status(404).json({ message: "Invalid Chat Code" });
        }

        if (targetUser._id.toString() === myId.toString()) {
            return res.status(400).json({ message: "You cannot add yourself" });
        }

        // 2. Add them to my contacts
        const me = await User.findById(myId);
        if (me.contacts.includes(targetUser._id)) {
            return res.status(400).json({ message: "User already in contacts" });
        }

        me.contacts.push(targetUser._id);
        await me.save();

        // 3. Optional: Add me to their contacts (Mutual friend)
        targetUser.contacts.push(myId);
        await targetUser.save();

        res.status(200).json({ 
            message: `Connected with ${targetUser.fullName}`,
            user: {
                _id: targetUser._id,
                fullName: targetUser.fullName,
                profilePic: targetUser.profilePic,
                email: targetUser.email,
                chatCode: targetUser.chatCode,
                publicKey: targetUser.publicKey
            }
        });
    } catch (error) {
        console.error("Error in connectByChatCode: ", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
