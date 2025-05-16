import { MongoClient } from 'mongodb';
import * as schema from "@shared/schema";

let db: any;
let mongoClient: MongoClient | null = null;

async function connectToMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }

  mongoClient = await MongoClient.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  return mongoClient.db();
}

async function initializeDb() {
  try {
    db = await connectToMongo();
    console.log('Successfully connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

initializeDb().catch(console.error);

export { db };