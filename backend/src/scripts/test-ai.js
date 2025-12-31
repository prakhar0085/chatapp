import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Fetching models...");
  try {
     // For v1beta, we might not have a direct listModels on genAI client in older versions, 
     // but let's try the model manager if exposed, or just infer.
     // Actually, standard way:
     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
     // There isn't a simple list function in the high-level SDK easily accessible without digging.
     // Let's rely on documentation or try 'gemini-1.5-flash-001'.
     console.log("Trying gemini-1.5-flash-001...");
     const r = await genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" }).generateContent("Hi");
     console.log("Success with gemini-1.5-flash-001");
  } catch (e) {
      console.log("Error:", e.message);
  }
}

listModels();
