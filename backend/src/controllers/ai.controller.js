import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import bcrypt from "bcryptjs";
import Groq from "groq-sdk";

export const getAIResponse = async (req, res) => {
  try {
    const { text } = req.body;
    const currentUserId = req.user._id;

    // 1. Find or Create the AI User in DB
    let aiUser = await User.findOne({ email: "ai@bot.com" });
    if (!aiUser) {
      aiUser = await User.create({
        email: "ai@bot.com",
        fullName: "AI Assistant",
        password: await bcrypt.hash("ai-bot-secure-password", 10),
        profilePic: "/ai.png" // Ensure you have this or use a URL
      });
    }

    // 2. Save USER'S message to DB
    const userMessage = new Message({
      senderId: currentUserId,
      receiverId: aiUser._id,
      text: text,
    });
    await userMessage.save();


    // 3. Get Response from Groq
    let aiText = "I am creating my response...";
    if (process.env.GROQ_API_KEY) {
        try {
            const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
            const completion = await groq.chat.completions.create({
                messages: [{ role: "user", content: text }],
                model: "llama-3.3-70b-versatile",
            });
            aiText = completion.choices[0]?.message?.content || aiText;
        } catch (e) {
            console.warn("Groq Error, using fallback");
            aiText = "I'm currently offline (API Error). But I received your message: " + text;
        }
    } else {
        aiText = "I am in Demo Mode (No API Key).";
    }

    // 4. Save AI'S message to DB
    const aiMessage = new Message({
      senderId: aiUser._id, // The AI User ID
      receiverId: currentUserId,
      text: aiText,
    });
    await aiMessage.save();

    // 5. Return the AI message (Frontend will append it)
    res.status(200).json(aiMessage);

  } catch (error) {
    console.error("AI Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getSmartSuggestions = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({ suggestions: ["👍", "Sounds good!", "Ok"] });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `Given the last message in a chat: "${message}", suggest 3 short, relevant, and conversational replies. 
    Return strictly a JSON array of strings, e.g., ["Reply 1", "Reply 2", "Reply 3"]. Do not include any other text.`;

    const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
    });

    let suggestions = ["Okay", "Interesting", "Tell me more"]; // defaults
    const responseText = completion.choices[0]?.message?.content;
    
    try {
        // Try to parse the JSON array from the response
        const parsed = JSON.parse(responseText);
        if (Array.isArray(parsed)) {
            suggestions = parsed.slice(0, 3);
        }
    } catch (e) {
        // If parsing fails, use fallback or simple split if possible
        console.warn("Failed to parse AI suggestions JSON:", responseText);
    }

    res.status(200).json({ suggestions });

  } catch (error) {
    console.error("AI Suggestions Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
