import { MongoClient, Db } from "mongodb";
import * as schema from "@shared/schema";
import express from "express";

let db: Db | null = null;
let mongoClient: MongoClient | null = null;

async function connectToMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }
  if (mongoClient && db) {
    // Already connected
    return db;
  }
  mongoClient = new MongoClient(process.env.MONGO_URI);
  await mongoClient.connect();
  db = mongoClient.db();
  console.log("Connected to MongoDB");
  return db;
}

async function initializeDb() {
  try {
    await connectToMongo();
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

function getDb(): Db {
  if (!db) {
    throw new Error("Database not initialized. Call initializeDb() first.");
  }
  return db;
}

const router = express.Router();

// Middleware to ensure DB is initialized before handling requests
router.use((req, res, next) => {
  if (!db) {
    res.status(503).json({ error: "Database not initialized" });
  } else {
    next();
  }
});

// Example API endpoint to fetch chat history
router.get("/api/chat-history", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const chats = await getDb()
      .collection("chats")
      .find({ user_id: userId })
      .toArray();
    res.json(chats);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoDB connection closed");
  }
  process.exit(0);
});

export { getDb, initializeDb, router as default };
