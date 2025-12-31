import { createClient } from "redis";
import dotenv from "dotenv";
import path from "path";

// Load .env from the backend root (two levels up from scripts)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const testRedis = async () => {
  console.log("Testing Redis Connection...");
  // Mask the password for security in logs
  const url = process.env.REDIS_URL;
  console.log("Redis URL Configured:", url ? "YES" : "NO");
  
  if (!url) {
      console.error("❌ Error: REDIS_URL is missing from .env");
      process.exit(1);
  }

  const client = createClient({ url });

  client.on("error", (err) => {
      console.error("❌ Redis Client Error:", err.message);
      // We don't exit here immediately, let the connect promise fail
  });

  try {
    console.log("Attempting to connect...");
    await client.connect();
    console.log("✅ Successfully connected to Redis!");
    
    // Test Write
    await client.set("test_connection", "Working");
    console.log("✅ Write Test Passed (Set 'test_connection')");

    // Test Read
    const value = await client.get("test_connection");
    console.log(`✅ Read Test Passed. Value retrieved: "${value}"`);

    // Clean up
    await client.del("test_connection");
    await client.disconnect();
    console.log("✅ Disconnected. Test Complete.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Fatal Connection Failed:", error.message);
    process.exit(1);
  }
};

testRedis();
