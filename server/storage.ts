import { 
  User, InsertUser, 
  ChatConversation, InsertChatConversation,
  ChatMessage, InsertChatMessage,
  AnalysisResult, InsertAnalysisResult,
  RecommendationSet, InsertRecommendationSet,
  RecommendationItem, InsertRecommendationItem
} from "@shared/schema";
import { v4 as uuidv4 } from "uuid";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Chat conversation operations
  getConversations(userId: string): Promise<ChatConversation[]>;
  getConversation(id: string): Promise<ChatConversation | undefined>;
  createConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateConversation(id: string, data: Partial<ChatConversation>): Promise<ChatConversation>;
  deleteConversation(id: string): Promise<void>;

  // Chat message operations
  getMessages(conversationId: string): Promise<ChatMessage[]>;
  createMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Analysis result operations
  getAnalysisResults(userId: string, type?: string): Promise<AnalysisResult[]>;
  getAnalysisResult(id: string): Promise<AnalysisResult | undefined>;
  createAnalysisResult(result: InsertAnalysisResult): Promise<AnalysisResult>;
  deleteAnalysisResult(id: string): Promise<void>;

  // Recommendation operations
  getRecommendationSets(userId: string): Promise<RecommendationSet[]>;
  getRecommendationSet(id: string): Promise<RecommendationSet | undefined>;
  getRecommendationItems(setId: string): Promise<RecommendationItem[]>;
  createRecommendationSet(set: InsertRecommendationSet): Promise<RecommendationSet>;
  createRecommendationItem(item: InsertRecommendationItem): Promise<RecommendationItem>;
  deleteRecommendationSet(id: string): Promise<void>;
}

import { db } from "./db";
import { 
  users, chatConversations, chatMessages, analysisResults,
  recommendationSets, recommendationItems,
  usersRelations, chatConversationsRelations, chatMessagesRelations, analysisResultsRelations,
  recommendationSetsRelations, recommendationItemsRelations
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(userData: InsertUser): Promise<User> {
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  // Chat conversation operations
  async getConversations(userId: string): Promise<ChatConversation[]> {
    return await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.user_id, userId))
      .orderBy(desc(chatConversations.updated_at));
  }

  async getConversation(id: string): Promise<ChatConversation | undefined> {
    const result = await db.select().from(chatConversations).where(eq(chatConversations.id, id));
    return result[0];
  }

  async createConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const result = await db.insert(chatConversations).values({
      ...conversation,
      updated_at: new Date(),
      created_at: new Date()
    }).returning();
    return result[0];
  }

  async updateConversation(id: string, data: Partial<ChatConversation>): Promise<ChatConversation> {
    // Set the updated_at timestamp
    const updateData = {
      ...data,
      updated_at: new Date()
    };

    const result = await db
      .update(chatConversations)
      .set(updateData)
      .where(eq(chatConversations.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Conversation not found");
    }

    return result[0];
  }

  async deleteConversation(id: string): Promise<void> {
    // The cascade delete will handle removing messages automatically
    await db.delete(chatConversations).where(eq(chatConversations.id, id));
  }

  // Chat message operations
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.conversation_id, conversationId))
      .orderBy(chatMessages.created_at);
  }

  async createMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(messageData).returning();

    // Update the conversation's updated_at timestamp
    await db
      .update(chatConversations)
      .set({ updated_at: new Date() })
      .where(eq(chatConversations.id, messageData.conversation_id));

    return result[0];
  }

  // Analysis result operations
  async getAnalysisResults(userId: string, type?: string): Promise<AnalysisResult[]> {
    if (type) {
      return await db
        .select()
        .from(analysisResults)
        .where(
          and(
            eq(analysisResults.user_id, userId),
            eq(analysisResults.type, type)
          )
        )
        .orderBy(desc(analysisResults.updated_at));
    } else {
      return await db
        .select()
        .from(analysisResults)
        .where(eq(analysisResults.user_id, userId))
        .orderBy(desc(analysisResults.updated_at));
    }
  }

  async getAnalysisResult(id: string): Promise<AnalysisResult | undefined> {
    const result = await db.select().from(analysisResults).where(eq(analysisResults.id, id));
    return result[0];
  }

  async createAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResult> {
    const result = await db.insert(analysisResults).values(resultData).returning();
    return result[0];
  }

  async deleteAnalysisResult(id: string): Promise<void> {
    await db.delete(analysisResults).where(eq(analysisResults.id, id));
  }

  // Recommendation operations
  async getRecommendationSets(userId: string): Promise<RecommendationSet[]> {
    return await db
      .select()
      .from(recommendationSets)
      .where(eq(recommendationSets.user_id, userId))
      .orderBy(desc(recommendationSets.created_at));
  }

  async getRecommendationSet(id: string): Promise<RecommendationSet | undefined> {
    const result = await db.select().from(recommendationSets).where(eq(recommendationSets.id, id));
    return result[0];
  }

  async getRecommendationItems(setId: string): Promise<RecommendationItem[]> {
    return await db
      .select()
      .from(recommendationItems)
      .where(eq(recommendationItems.set_id, setId))
      .orderBy(desc(recommendationItems.created_at));
  }

  async createRecommendationSet(setData: InsertRecommendationSet): Promise<RecommendationSet> {
    const result = await db.insert(recommendationSets).values(setData).returning();
    return result[0];
  }

  async createRecommendationItem(itemData: InsertRecommendationItem): Promise<RecommendationItem> {
    const result = await db.insert(recommendationItems).values(itemData).returning();
    return result[0];
  }

  async deleteRecommendationSet(id: string): Promise<void> {
    // The cascade delete will handle removing items automatically
    await db.delete(recommendationSets).where(eq(recommendationSets.id, id));
  }
}

// Export a singleton instance
export const storage = new DatabaseStorage();