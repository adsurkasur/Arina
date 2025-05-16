
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import ws from "ws";
import * as schema from "@shared/schema";
import path from 'path';

neonConfig.webSocketConstructor = ws;

let db: any;

try {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzle({ client: pool, schema });
  console.log('Connected to Neon database');
} catch (error) {
  console.warn('Failed to connect to Neon database, falling back to SQLite:', error.message);
  
  const sqlite = new Database(path.join(process.cwd(), 'local.db'));
  db = drizzleSqlite(sqlite, { schema });
}

export { db };
