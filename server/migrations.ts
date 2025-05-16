
import { db } from './db';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function migrate() {
  console.log('Running migrations...');
  
  const isSQLite = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('sqlite');
  
  try {
    if (isSQLite) {
      console.log('Running SQLite migrations...');
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          photo_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('SQLite migrations completed');
      return;
    }

    // PostgreSQL migrations
    let migrationSuccessful = false;
    const maxRetries = 3;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`PostgreSQL migration attempt ${attempt + 1}/${maxRetries}`);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            photo_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS chat_conversations (
            id UUID PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS chat_messages (
            id UUID PRIMARY KEY,
            conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS analysis_results (
            id UUID PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            data JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS recommendation_sets (
            id UUID PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            summary TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        await db.execute(sql`
          CREATE TABLE IF NOT EXISTS recommendation_items (
            id UUID PRIMARY KEY,
            set_id UUID NOT NULL REFERENCES recommendation_sets(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            confidence TEXT NOT NULL,
            data JSONB NOT NULL,
            source TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        migrationSuccessful = true;
        console.log('Migrations completed successfully');
        break;
      } catch (error) {
        console.error(`Migration attempt ${attempt + 1} failed:`, error);
        
        if (attempt === maxRetries - 1) {
          throw error;
        }
        
        console.log(`Retrying in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!migrationSuccessful) {
      throw new Error(`Failed to complete migrations after ${maxRetries} attempts`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
