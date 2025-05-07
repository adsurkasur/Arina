import { 
  User, InsertUser, 
  ChatConversation, InsertChatConversation,
  ChatMessage, InsertChatMessage,
  AnalysisResult, InsertAnalysisResult
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
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, ChatConversation>;
  private messages: Map<string, ChatMessage>;
  private analysisResults: Map<string, AnalysisResult>;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.analysisResults = new Map();
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(userData: InsertUser): Promise<User> {
    const now = new Date().toISOString();
    const user: User = {
      ...userData,
      created_at: now
    };
    this.users.set(user.id, user);
    return user;
  }

  // Chat conversation operations
  async getConversations(userId: string): Promise<ChatConversation[]> {
    return Array.from(this.conversations.values())
      .filter(conversation => conversation.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getConversation(id: string): Promise<ChatConversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(conversationData: InsertChatConversation): Promise<ChatConversation> {
    const now = new Date().toISOString();
    const id = uuidv4();
    const conversation: ChatConversation = {
      id,
      ...conversationData,
      created_at: now,
      updated_at: now
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, data: Partial<ChatConversation>): Promise<ChatConversation> {
    const conversation = this.conversations.get(id);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const updated: ChatConversation = {
      ...conversation,
      ...data,
      updated_at: new Date().toISOString()
    };
    this.conversations.set(id, updated);
    return updated;
  }

  async deleteConversation(id: string): Promise<void> {
    // Delete associated messages first
    const messagesToDelete = Array.from(this.messages.values())
      .filter(message => message.conversation_id === id);
    
    for (const message of messagesToDelete) {
      this.messages.delete(message.id);
    }
    
    // Then delete the conversation
    this.conversations.delete(id);
  }

  // Chat message operations
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversation_id === conversationId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  async createMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const message: ChatMessage = {
      id,
      ...messageData,
      created_at: now
    };
    this.messages.set(id, message);
    
    // Update conversation's updated_at timestamp
    const conversation = this.conversations.get(messageData.conversation_id);
    if (conversation) {
      this.updateConversation(conversation.id, { updated_at: now });
    }
    
    return message;
  }

  // Analysis result operations
  async getAnalysisResults(userId: string, type?: string): Promise<AnalysisResult[]> {
    let results = Array.from(this.analysisResults.values())
      .filter(result => result.user_id === userId);
    
    if (type) {
      results = results.filter(result => result.type === type);
    }
    
    return results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async getAnalysisResult(id: string): Promise<AnalysisResult | undefined> {
    return this.analysisResults.get(id);
  }

  async createAnalysisResult(resultData: InsertAnalysisResult): Promise<AnalysisResult> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const result: AnalysisResult = {
      id,
      ...resultData,
      created_at: now,
      updated_at: now
    };
    this.analysisResults.set(id, result);
    return result;
  }

  async deleteAnalysisResult(id: string): Promise<void> {
    this.analysisResults.delete(id);
  }
}

// Export a singleton instance
export const storage = new MemStorage();
