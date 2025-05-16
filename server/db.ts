
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { MongoClient } from 'mongodb';
import ws from "ws";
import * as schema from "@shared/schema";
import path from 'path';

neonConfig.webSocketConstructor = ws;

let db: any;
let mongoClient: MongoClient | null = null;

async function connectToMongo() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI not set");
  }
  
  const client = await MongoClient.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');
  return client.db();
}

async function initializeDb() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL not set");
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema });
    console.log('Connected to Neon database');
  } catch (error) {
    console.warn('Failed to connect to Neon database:', error.message);
    
    try {
      const mongoDb = await connectToMongo();
      db = mongoDb;
      console.log('Successfully connected to MongoDB fallback');
    } catch (mongoError) {
      console.warn('Failed to connect to MongoDB, falling back to SQLite:', mongoError.message);
      const sqlite = new Database(path.join(process.cwd(), 'local.db'));
      db = drizzleSqlite(sqlite, { schema });
    }
  }
}

initializeDb().catch(console.error);

export { db };
