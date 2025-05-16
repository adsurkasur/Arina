import { MongoClient } from "mongodb";
import * as schema from "@shared/schema";
import express from "express";

let db: any;
let mongoClient: InstanceType<typeof MongoClient> | null = null;

async function connectToMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }

  mongoClient = await MongoClient.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  return mongoClient.db();
}

async function initializeDb() {
  try {
    db = await connectToMongo();
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

const router = express.Router();

// Example API endpoint to fetch chat history
router.get("/api/chat-history", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const chats = await db
      .collection("chats")
      .find({ user_id: userId })
      .toArray();
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

export { db, initializeDb, router as default };
