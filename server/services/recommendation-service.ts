import { storage } from "../storage";
import { 
  ChatMessage, 
  AnalysisResult, 
  RecommendationSet, 
  InsertRecommendationSet, 
  RecommendationItem, 
  InsertRecommendationItem 
} from "@shared/schema";
import { generateRecommendations } from "@shared/recommendation-engine";

interface GenerateRecommendationsParams {
  userId: string;
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
}

export class RecommendationService {
  
  /**
   * Generate recommendations based on user's analysis results and chat history
   */
  async generateRecommendations(params: GenerateRecommendationsParams): Promise<RecommendationSet> {
    const { userId, currentSeason } = params;
    
    // Fetch user's analysis results
    const analysisResults = await storage.getAnalysisResults(userId);
    
    // Fetch user's chat history
    // We'll combine all chat messages from all conversations
    const conversations = await storage.getConversations(userId);
    let allMessages: ChatMessage[] = [];
    
    for (const conversation of conversations) {
      const messages = await storage.getMessages(conversation.id);
      allMessages = [...allMessages, ...messages];
    }
    
    // Generate recommendations using the engine
    const recommendationData = generateRecommendations({
      userId,
      analysisResults,
      chatHistory: allMessages,
      currentSeason
    });
    
    // Save recommendation set to database
    const insertSetData: InsertRecommendationSet = {
      user_id: userId,
      summary: recommendationData.summary
    };
    
    const savedSet = await storage.createRecommendationSet(insertSetData);
    
    // Save all recommendation items
    const savedItems: RecommendationItem[] = [];
    
    for (const item of recommendationData.recommendations) {
      const insertItemData: InsertRecommendationItem = {
        set_id: savedSet.id,
        type: item.type,
        title: item.title,
        description: item.description,
        confidence: item.confidence.toString(), // Convert to string for storage
        data: item.data,
        source: item.source
      };
      
      const savedItem = await storage.createRecommendationItem(insertItemData);
      savedItems.push(savedItem);
    }
    
    // Return the saved set with its ID
    return {
      ...savedSet,
      // Add items for convenience in the response
      items: savedItems
    } as RecommendationSet & { items: RecommendationItem[] };
  }
  
  /**
   * Get all recommendation sets for a user
   */
  async getUserRecommendations(userId: string): Promise<(RecommendationSet & { items: RecommendationItem[] })[]> {
    const sets = await storage.getRecommendationSets(userId);
    const result = [];
    
    for (const set of sets) {
      const items = await storage.getRecommendationItems(set.id);
      result.push({
        ...set,
        items
      });
    }
    
    return result;
  }
  
  /**
   * Get a specific recommendation set with its items
   */
  async getRecommendationSet(setId: string): Promise<(RecommendationSet & { items: RecommendationItem[] }) | null> {
    const set = await storage.getRecommendationSet(setId);
    if (!set) return null;
    
    const items = await storage.getRecommendationItems(setId);
    
    return {
      ...set,
      items
    };
  }
  
  /**
   * Delete a recommendation set and all its items
   */
  async deleteRecommendationSet(setId: string): Promise<void> {
    await storage.deleteRecommendationSet(setId);
  }
}

// Export a singleton instance
export const recommendationService = new RecommendationService();