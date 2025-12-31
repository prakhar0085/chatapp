import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const modelsToTry = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-pro",
  "gemini-1.0-pro",
  "gemini-1.0-pro-001"
];

async function findWorkingModel() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  console.log("Testing models with your API Key...");

  for (const modelName of modelsToTry) {
    try {
      console.log(`Trying: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello");
      const response = await result.response;
      console.log(`✅ SUCCESS! Model '${modelName}' is working.`);
      console.log("Response:", response.text());
      return; 
    } catch (error) {
       // console.log(`❌ Failed '${modelName}':`, error.message.split(":")[0]);
       // Just suppress detail for cleaner output
       process.stdout.write("❌ ");
    }
  }
  console.log("\n⚠️ All models failed. Please check your API Key, Billing, or Region.");
}

findWorkingModel();
