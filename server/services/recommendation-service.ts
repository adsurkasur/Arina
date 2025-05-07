import { v4 as uuid } from 'uuid';
import { storage } from '../storage';
import { generateRecommendations } from '@shared/recommendation-engine';
import type { 
  RecommendationSet, 
  RecommendationItem, 
  InsertRecommendationSet, 
  InsertRecommendationItem 
} from '@shared/schema';

interface GenerateRecommendationsParams {
  userId: string;
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
}

export class RecommendationService {
  /**
   * Generate recommendations based on user's analysis results and chat history
   */
  async generateRecommendations(params: GenerateRecommendationsParams): Promise<RecommendationSet & { items: RecommendationItem[] }> {
    try {
      const { userId, currentSeason } = params;

      // Get user's analysis results
      const analysisResults = await storage.getAnalysisResults(userId);

      // Get conversations for the user
      const conversations = await storage.getConversations(userId);

      // Get messages from all conversations
      const chatMessages = [];
      for (const conversation of conversations) {
        const messages = await storage.getMessages(conversation.id);
        chatMessages.push(...messages);
      }

      // Generate recommendations
      const recommendationInput = {
        userId,
        analysisResults,
        chatHistory: chatMessages,
        currentSeason
      };

      // Use our recommendation engine to generate recommendations
      const recommendations = generateRecommendations(recommendationInput);

      // Store in the database
      const setId = uuid();

      const insertSetData: InsertRecommendationSet = {
        id: setId,
        user_id: userId,
        summary: recommendations.summary,
        created_at: new Date()
      };

      // Create the recommendation set
      const recommendationSet = await storage.createRecommendationSet(insertSetData);

      // Create all recommendation items
      const items: RecommendationItem[] = [];

      for (const rec of recommendations.recommendations) {
        const insertItemData: InsertRecommendationItem = {
          id: uuid(),
          set_id: setId,
          type: rec.type,
          title: rec.title,
          description: rec.description,
          confidence: rec.confidence,
          data: rec.data,
          source: rec.source,
          created_at: new Date()
        };

        const item = await storage.createRecommendationItem(insertItemData);
        items.push(item);
      }

      return {
        ...recommendationSet,
        items
      };
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  /**
   * Get all recommendation sets for a user
   */
  async getUserRecommendations(userId: string): Promise<(RecommendationSet & { items: RecommendationItem[] })[]> {
    try {
      // Get all recommendation sets for the user
      const sets = await storage.getRecommendationSets(userId);

      // For each set, get its items
      const result = [];

      for (const set of sets) {
        const items = await storage.getRecommendationItems(set.id);
        result.push({
          ...set,
          items
        });
      }

      return result;
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      throw error;
    }
  }

  /**
   * Get a specific recommendation set with its items
   */
  async getRecommendationSet(setId: string): Promise<(RecommendationSet & { items: RecommendationItem[] }) | null> {
    try {
      // Get the recommendation set
      const set = await storage.getRecommendationSet(setId);

      if (!set) {
        return null;
      }

      // Get the items for this set
      const items = await storage.getRecommendationItems(setId);

      return {
        ...set,
        items
      };
    } catch (error) {
      console.error('Error getting recommendation set:', error);
      throw error;
    }
  }

  /**
   * Delete a recommendation set and all its items
   */
  async deleteRecommendationSet(setId: string): Promise<void> {
    try {
      await storage.deleteRecommendationSet(setId);
    } catch (error) {
      console.error('Error deleting recommendation set:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const recommendationService = new RecommendationService();