import { v4 as uuidv4 } from "uuid";
import { getDb } from "./db.js";
import {
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
} from "../shared/schema.js";
import { z } from "zod";

const chatConversationSchema = z.object({
  user_id: z.string(),
  title: z.string(),
});

const chatMessageSchema = z.object({
  conversation_id: z.string(),
  role: z.string(), // 'user' or 'assistant'
  content: z.string(),
  sender_id: z.string(),
});

export class DatabaseStorage {
  async getUser(id: string): Promise<User | undefined> {
    const user = await getDb().collection("users").findOne({ id });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photo_url: user.photo_url ?? null,
      created_at: user.created_at ?? null,
      dark_mode: user.dark_mode ?? false, // NEW
      language: user.language ?? "en",   // NEW
    };
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await getDb().collection("users").findOne({ email });
    if (!user) return undefined;
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photo_url: user.photo_url ?? null,
      created_at: user.created_at ?? null,
      dark_mode: user.dark_mode ?? false, // NEW
      language: user.language ?? "en",   // NEW
    };
  }

  async createUser(userData: InsertUser): Promise<User> {
    const user = {
      ...userData,
      created_at: new Date(),
      dark_mode: userData.dark_mode ?? false, // NEW
      language: userData.language ?? "en",   // NEW
    };
    await getDb().collection("users").insertOne(user);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      photo_url: user.photo_url ?? null,
      created_at: user.created_at ?? null,
      dark_mode: user.dark_mode ?? false, // NEW
      language: user.language ?? "en",   // NEW
    };
  }

  async updateUserPreferences(id: string, prefs: { dark_mode?: boolean; language?: string }): Promise<User | undefined> {
    const updateData: any = {};
    if (prefs.dark_mode !== undefined) updateData.dark_mode = prefs.dark_mode;
    if (prefs.language) updateData.language = prefs.language;
    if (Object.keys(updateData).length === 0) {
      // No update fields provided, just return the user as-is
      return this.getUser(id);
    }
    const result = await getDb().collection("users").findOneAndUpdate(
      { id },
      { $set: updateData },
      { returnDocument: "after" }
    );
    if (!result || !result.value) return undefined;
    return {
      id: result.value.id,
      email: result.value.email,
      name: result.value.name,
      photo_url: result.value.photo_url ?? null,
      created_at: result.value.created_at ?? null,
      dark_mode: result.value.dark_mode ?? false,
      language: result.value.language ?? "en",
    };
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    const results = await getDb()
      .collection("chat_conversations")
      .find({ user_id: userId })
      .sort({ updated_at: -1 })
      .toArray();
    return results.map((c: any) => ({
      id: c.id,
      user_id: c.user_id,
      title: c.title,
      created_at: c.created_at ?? null,
      updated_at: c.updated_at ?? null,
    }));
  }

  async getConversation(id: string): Promise<ChatConversation | undefined> {
    const c = await getDb()
      .collection("chat_conversations")
      .findOne({ id });
    if (!c) return undefined;
    return {
      id: c.id,
      user_id: c.user_id,
      title: c.title,
      created_at: c.created_at ?? null,
      updated_at: c.updated_at ?? null,
    };
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
      await getDb().collection("chat_conversations").insertOne(conversation);
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
    const result = await getDb()
      .collection("chat_conversations")
      .findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: "after" },
      );
    if (!result || !result.value) throw new Error("Conversation not found");
    const c = result.value;
    return {
      id: c.id,
      user_id: c.user_id,
      title: c.title,
      created_at: c.created_at ?? null,
      updated_at: c.updated_at ?? null,
    };
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await getDb().collection("chat_conversations").deleteOne({ id });
      await getDb().collection("chat_messages").deleteMany({ conversation_id: id });
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
      const results = await getDb()
        .collection("chat_messages")
        .find({ conversation_id: conversationId })
        .sort({ created_at: 1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      return results.map((m: any) => ({
        id: m.id,
        conversation_id: m.conversation_id,
        role: m.role,
        content: m.content,
        created_at: m.created_at ?? null,
      }));
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
      await getDb().collection("chat_messages").insertOne(message);
      await getDb()
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
    const results = await getDb()
      .collection("analysis_results")
      .find(query)
      .sort({ updated_at: -1 })
      .toArray();
    return results.map((r: any) => ({
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      data: r.data,
      created_at: r.created_at ?? null,
      updated_at: r.updated_at ?? null,
    }));
  }

  async getAnalysisResult(id: string): Promise<AnalysisResult | undefined> {
    const r = await getDb().collection("analysis_results").findOne({ id });
    if (!r) return undefined;
    return {
      id: r.id,
      user_id: r.user_id,
      type: r.type,
      data: r.data,
      created_at: r.created_at ?? null,
      updated_at: r.updated_at ?? null,
    };
  }

  async getRecommendationSets(userId: string): Promise<RecommendationSet[]> {
    const results = await getDb()
      .collection("recommendation_sets")
      .find({ user_id: userId })
      .sort({ created_at: -1 })
      .toArray();
    return results.map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      summary: s.summary,
      created_at: s.created_at ?? null,
    }));
  }

  async getRecommendationSet(
    id: string,
  ): Promise<RecommendationSet | undefined> {
    const s = await getDb().collection("recommendation_sets").findOne({ id });
    if (!s) return undefined;
    return {
      id: s.id,
      user_id: s.user_id,
      summary: s.summary,
      created_at: s.created_at ?? null,
    };
  }

  async getRecommendationItems(setId: string): Promise<RecommendationItem[]> {
    const results = await getDb()
      .collection("recommendation_items")
      .find({ set_id: setId })
      .sort({ created_at: -1 })
      .toArray();
    return results.map((i: any) => ({
      id: i.id,
      set_id: i.set_id,
      title: i.title,
      type: i.type,
      description: i.description,
      confidence: i.confidence,
      data: i.data,
      source: i.source,
      created_at: i.created_at ?? null,
    }));
  }

  async createRecommendationSet(
    setData: InsertRecommendationSet,
  ): Promise<RecommendationSet> {
    const set = {
      id: uuidv4(),
      ...setData,
      created_at: new Date(),
    };
    await getDb().collection("recommendation_sets").insertOne(set);
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
    await getDb().collection("recommendation_items").insertOne(item);
    return item;
  }

  async createAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResult> {
    const result = {
      id: uuidv4(),
      ...resultData,
      created_at: new Date(),
      updated_at: new Date(),
    };
    await getDb().collection("analysis_results").insertOne(result);
    return result;
  }

  async deleteRecommendationSet(id: string): Promise<void> {
    await getDb().collection("recommendation_sets").deleteOne({ id });
    await getDb().collection("recommendation_items").deleteMany({ set_id: id });
  }

  async deleteAnalysisResult(id: string): Promise<void> {
    try {
      const result = await getDb().collection("analysis_results").deleteOne({ id });
      if (result.deletedCount === 0) {
        throw new Error(`Analysis result with ID ${id} not found`);
      }
    } catch (error) {
      console.error("Error deleting analysis result:", error);
      throw new Error("Failed to delete analysis result");
    }
  }

  // Update a user's id and all related collections to the new id
  async updateUserId(oldId: string, newId: string): Promise<void> {
    const db = getDb();
    // Update user id in users collection
    const userUpdateResult = await db.collection("users").updateOne({ id: oldId }, { $set: { id: newId } });
    console.log(`[updateUserId] Updated user id from ${oldId} to ${newId}:`, userUpdateResult.modifiedCount);
    // Update user_id in chat_conversations
    const convUpdate = await db.collection("chat_conversations").updateMany({ user_id: oldId }, { $set: { user_id: newId } });
    // Update user_id in analysis_results
    const analysisUpdate = await db.collection("analysis_results").updateMany({ user_id: oldId }, { $set: { user_id: newId } });
    // Update user_id in recommendation_sets
    const recSetUpdate = await db.collection("recommendation_sets").updateMany({ user_id: oldId }, { $set: { user_id: newId } });
    console.log(`[updateUserId] Updated related collections:`, {
      convUpdate: convUpdate.modifiedCount,
      analysisUpdate: analysisUpdate.modifiedCount,
      recSetUpdate: recSetUpdate.modifiedCount
    });
    // Confirm user exists with new id
    const user = await db.collection("users").findOne({ id: newId });
    console.log(`[updateUserId] User with new id exists:`, !!user);
  }

  async deleteUserAccount(userId: string): Promise<void> {
    const db = getDb();
    try {
      // Start a session for transaction, if your MongoDB setup supports it
      // const session = db.client.startSession(); 
      // await session.withTransaction(async () => {

      // 1. Delete user document
      const userDeletionResult = await db.collection("users").deleteOne({ id: userId }/*, { session }*/);
      if (userDeletionResult.deletedCount === 0) {
        // If user not found, perhaps already deleted or never existed. 
        // Depending on desired behavior, could throw error or log and continue.
        console.warn(`[deleteUserAccount] User with ID ${userId} not found for deletion.`);
        // throw new Error(`User with ID ${userId} not found.`); 
      }

      // 2. Delete associated chat conversations and their messages
      const conversations = await db.collection("chat_conversations").find({ user_id: userId }/*, { session }*/).toArray();
      for (const conv of conversations) {
        await db.collection("chat_messages").deleteMany({ conversation_id: conv.id }/*, { session }*/);
      }
      await db.collection("chat_conversations").deleteMany({ user_id: userId }/*, { session }*/);

      // 3. Delete associated analysis results
      await db.collection("analysis_results").deleteMany({ user_id: userId }/*, { session }*/);

      // 4. Delete associated recommendation sets and their items
      const recommendationSets = await db.collection("recommendation_sets").find({ user_id: userId }/*, { session }*/).toArray();
      for (const recSet of recommendationSets) {
        await db.collection("recommendation_items").deleteMany({ set_id: recSet.id }/*, { session }*/);
      }
      await db.collection("recommendation_sets").deleteMany({ user_id: userId }/*, { session }*/);

      // });
      // await session.endSession();
      console.log(`[deleteUserAccount] Successfully deleted account and associated data for user ID ${userId}`);

    } catch (error) {
      console.error(`[deleteUserAccount] Error deleting user account for ID ${userId}:`, error);
      // if (session && session.inTransaction()) {
      //   await session.abortTransaction();
      // }
      // if (session) {
      //   await session.endSession();
      // }
      throw new Error(`Failed to delete user account data: ${(error as Error).message}`);
    }
  }
}

export const storage = new DatabaseStorage();
