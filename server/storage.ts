import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import {
  IStorage,
  User,
  InsertUser,
  ChatConversation,
  InsertChatConversation,
  ChatMessage,
  InsertChatMessage,
  AnalysisResult,
  InsertAnalysisResult,
  RecommendationSet,
  InsertRecommendationSet,
  RecommendationItem,
  InsertRecommendationItem,
} from "@shared/schema";
import { z } from "zod";

const chatConversationSchema = z.object({
  user_id: z.string(),
  title: z.string(),
});

const chatMessageSchema = z.object({
  conversation_id: z.string(),
  content: z.string(),
  sender_id: z.string(),
});

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await db.collection("users").findOne({ id });
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await db.collection("users").findOne({ email });
    return user || undefined;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = {
      ...userData,
      created_at: new Date(),
    };
    await db.collection("users").insertOne(user);
    return user;
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    return await db
      .collection("chat_conversations")
      .find({ user_id: userId })
      .sort({ updated_at: -1 })
      .toArray();
  }

  async getConversation(id: string): Promise<ChatConversation | undefined> {
    const conversation = await db
      .collection("chat_conversations")
      .findOne({ id });
    return conversation || undefined;
  }

  async createConversation(
    conversationData: InsertChatConversation,
  ): Promise<ChatConversation> {
    try {
      chatConversationSchema.parse(conversationData);
      const conversation = {
        id: uuidv4(),
        ...conversationData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      await db.collection("chat_conversations").insertOne(conversation);
      return conversation;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw new Error("Failed to create conversation");
    }
  }

  async updateConversation(
    id: string,
    data: Partial<ChatConversation>,
  ): Promise<ChatConversation> {
    const updateData = {
      ...data,
      updated_at: new Date(),
    };
    const result = await db
      .collection("chat_conversations")
      .findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after" },
      );
    if (!result) throw new Error("Conversation not found");
    return result;
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await db.collection("chat_conversations").deleteOne({ id });
      await db.collection("chat_messages").deleteMany({ conversation_id: id });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw new Error("Failed to delete conversation");
    }
  }

  async getMessages(
    conversationId: string,
    limit: number = 50,
    skip: number = 0,
  ): Promise<ChatMessage[]> {
    try {
      return await db
        .collection("chat_messages")
        .find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();
    } catch (error) {
      console.error("Error fetching messages:", error);
      throw new Error("Failed to fetch messages");
    }
  }

  async createMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    try {
      chatMessageSchema.parse(messageData);
      const message = {
        id: uuidv4(),
        ...messageData,
        created_at: new Date(),
      };
      await db.collection("chat_messages").insertOne(message);
      await db
        .collection("chat_conversations")
        .updateOne(
          { id: messageData.conversation_id },
          { $set: { updated_at: new Date() } },
        );
      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error("Failed to create message");
    }
  }

  async getAnalysisResults(
    userId: string,
    type?: string,
  ): Promise<AnalysisResult[]> {
    const query = type ? { user_id: userId, type } : { user_id: userId };
    return await db
      .collection("analysis_results")
      .find(query)
      .sort({ updated_at: -1 })
      .toArray();
  }

  async getAnalysisResult(id: string): Promise<AnalysisResult | undefined> {
    const result = await db.collection("analysis_results").findOne({ id });
    return result || undefined;
  }

  async createAnalysisResult(
    resultData: InsertAnalysisResult,
  ): Promise<AnalysisResult> {
    const result = {
      id: uuidv4(),
      ...resultData,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await db.collection("analysis_results").insertOne(result);
    return result;
  }

  async deleteAnalysisResult(id: string): Promise<void> {
    await db.collection("analysis_results").deleteOne({ id });
  }

  async getRecommendationSets(userId: string): Promise<RecommendationSet[]> {
    return await db
      .collection("recommendation_sets")
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
  }

  async getRecommendationSet(
    id: string,
  ): Promise<RecommendationSet | undefined> {
    const set = await db.collection("recommendation_sets").findOne({ id });
    return set || undefined;
  }

  async getRecommendationItems(setId: string): Promise<RecommendationItem[]> {
    return await db
      .collection("recommendation_items")
      .find({ set_id: setId })
      .sort({ created_at: -1 })
      .toArray();
  }

  async createRecommendationSet(
    setData: InsertRecommendationSet,
  ): Promise<RecommendationSet> {
    const set = {
      id: uuidv4(),
      ...setData,
      created_at: new Date(),
    };
    await db.collection("recommendation_sets").insertOne(set);
    return set;
  }

  async createRecommendationItem(
    itemData: InsertRecommendationItem,
  ): Promise<RecommendationItem> {
    const item = {
      id: uuidv4(),
      ...itemData,
      created_at: new Date(),
    };
    await db.collection("recommendation_items").insertOne(item);
    return item;
  }

  async deleteRecommendationSet(id: string): Promise<void> {
    await db.collection("recommendation_sets").deleteOne({ id });
    await db.collection("recommendation_items").deleteMany({ set_id: id });
  }

  async createRecommendationSetWithItems(
    setData: InsertRecommendationSet,
    itemsData: InsertRecommendationItem[],
  ): Promise<RecommendationSet> {
    const session = db.client.startSession();
    try {
      session.startTransaction();

      const set = {
        id: uuidv4(),
        ...setData,
        created_at: new Date(),
      };
      await db.collection("recommendation_sets").insertOne(set, { session });

      const items = itemsData.map((item) => ({
        id: uuidv4(),
        ...item,
        set_id: set.id,
        created_at: new Date(),
      }));
      await db
        .collection("recommendation_items")
        .insertMany(items, { session });

      await session.commitTransaction();
      return set;
    } catch (error) {
      await session.abortTransaction();
      console.error("Error creating recommendation set with items:", error);
      throw new Error("Failed to create recommendation set with items");
    } finally {
      session.endSession();
    }
  }
}

export const storage = new DatabaseStorage();
