import { Collection, Db } from 'mongodb';
import { UserSettings } from '../types/recommendations.js';

export class UserSettingsService {
  private collection: Collection<UserSettings>;

  constructor(db: Db) {
    this.collection = db.collection<UserSettings>('userSettings');
  }

  async getByUserId(userId: string): Promise<UserSettings | null> {
    const settings = await this.collection.findOne({ userId });
    if (!settings) {
      // Optionally, create default settings if none exist
      return this.createUserDefaultSettings(userId);
    }
    return settings;
  }

  async upsert(userId: string, settingsData: Partial<Omit<UserSettings, 'userId' | 'createdAt' | 'updatedAt'>>): Promise<UserSettings> {
    const now = new Date();
    const result = await this.collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...settingsData,
          updatedAt: now,
        },
        $setOnInsert: {
          userId,
          createdAt: now,
          // Ensure default values are set on creation if not provided
          theme: settingsData.theme || 'system',
          language: settingsData.language || 'en',
        },
      },
      { upsert: true, returnDocument: 'after' }
    );
    if (!result || !('value' in result) || !result.value) {
      // This should ideally not happen with upsert:true and returnDocument:'after'
      // but as a fallback, attempt to fetch or create.
      const existing = await this.getByUserId(userId);
      if (existing) return existing;
      // If somehow still null, create default (though upsert should handle this)
      return this.createUserDefaultSettings(userId);
    }
    // Defensive: ensure result.value is typed as UserSettings
    return result.value as UserSettings;
  }

  async createUserDefaultSettings(userId: string): Promise<UserSettings> {
    const defaultSettings: UserSettings = {
      userId,
      theme: 'system',
      language: 'en',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await this.collection.insertOne(defaultSettings);
    return defaultSettings;
  }
}

// Initialize and export the service
// This part depends on how you initialize your DB connection in db.ts
// For example, if db.ts exports a promise that resolves to a Db instance:
import { getDb } from '../db.js'; // Assuming getDb returns a Promise<Db>

let userSettingsServiceInstance: UserSettingsService;

export const getUserSettingsService = async (): Promise<UserSettingsService> => {
  if (!userSettingsServiceInstance) {
    const db = await getDb();
    userSettingsServiceInstance = new UserSettingsService(db);
  }
  return userSettingsServiceInstance;
};
