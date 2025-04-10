// lib/scripts/clearDatabase.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { MongoClient } from "mongodb";

// Calculate the path to your .env.local file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../../"); // Adjust depending on how deep your script is

// Load environment variables from .env.local file
dotenv.config({ path: path.join(rootDir, ".env.local") });

const clearDatabaseData = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("Please add MONGODB_URI to your environment variables");
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("driveshare");

    // List of collections to clear
    const requiredCollections = [
      "users",
      "cars",
      "bookings",
      "messages",
      "messageThreads",
      "notifications",
      "payments",
      "reviews",
      "securityQuestions",
    ];

    // Delete all documents from each collection
    for (const collection of requiredCollections) {
      try {
        const result = await db.collection(collection).deleteMany({});
        console.log(
          `Cleared ${result.deletedCount} documents from ${collection}`
        );
      } catch (error) {
        console.error(`Error clearing collection ${collection}:`, error);
      }
    }

    console.log("All collections have been cleared");
  } catch (error) {
    console.error("Error clearing database:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
};

clearDatabaseData().catch(console.error);
