import { db } from './db';

export async function migrate() {
  console.log('Running MongoDB migrations...');

  try {
    // Create collections with validators
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["id", "email", "name"],
          properties: {
            id: { bsonType: "string" },
            email: { bsonType: "string" },
            name: { bsonType: "string" },
            photo_url: { bsonType: ["string", "null"] },
            created_at: { bsonType: "date" }
          }
        }
      }
    });

    await db.createCollection('chat_conversations', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "title"],
          properties: {
            id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            title: { bsonType: "string" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
          }
        }
      }
    });

    await db.createCollection('chat_messages', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["conversation_id", "role", "content"],
          properties: {
            id: { bsonType: "string" },
            conversation_id: { bsonType: "string" },
            role: { bsonType: "string" },
            content: { bsonType: "string" },
            created_at: { bsonType: "date" }
          }
        }
      }
    });

    await db.createCollection('analysis_results', {
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["user_id", "type", "data"],
          properties: {
            id: { bsonType: "string" },
            user_id: { bsonType: "string" },
            type: { bsonType: "string" },
            data: { bsonType: "object" },
            created_at: { bsonType: "date" },
            updated_at: { bsonType: "date" }
          }
        }
      }
    });

    // Create indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('chat_conversations').createIndex({ user_id: 1 });
    await db.collection('chat_messages').createIndex({ conversation_id: 1 });
    await db.collection('analysis_results').createIndex({ user_id: 1 });

    console.log('MongoDB migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}