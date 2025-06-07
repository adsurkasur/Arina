import { AnalysisResult, ChatMessage } from "./db/schema.js";

// Types for recommendation engine
export interface RecommendationInput {
  userId: string;
  analysisResults: AnalysisResult[];
  chatHistory: ChatMessage[];
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
}

export interface RecommendationItem {
  id: string;
  type: 'crop' | 'business' | 'resource' | 'market';
  title: string;
  description: string;
  confidence: number; // 0-1 score indicating confidence level
  data: any; // Supporting data for the recommendation
  source: 'analysis' | 'chat' | 'pattern' | 'seasonal'; // Source of the recommendation
  createdAt: Date;
}

export interface RecommendationSet {
  id: string;
  userId: string;
  recommendations: RecommendationItem[];
  summary: string;
  createdAt: Date;
}

// Helper functions for recommendation generation

function sortByRecency(results: AnalysisResult[]): AnalysisResult[] {
  return [...results].sort((a, b) => {
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

function extractBusinessRecommendations(results: AnalysisResult[]): RecommendationItem[] {
  // Implementation for extracting business recommendations
  return [];
}

function extractForecastRecommendations(results: AnalysisResult[]): RecommendationItem[] {
  // Implementation for extracting forecast recommendations
  return [];
}

function extractOptimizationRecommendations(results: AnalysisResult[]): RecommendationItem[] {
  // Implementation for extracting optimization recommendations
  return [];
}

function extractChatInsights(chatHistory: ChatMessage[]): RecommendationItem[] {
  // Implementation for extracting insights from chat history
  return [];
}

function addSeasonalRecommendations(recommendations: RecommendationItem[], currentSeason?: 'spring' | 'summer' | 'fall' | 'winter'): RecommendationItem[] {
  // Implementation for adding seasonal recommendations
  return recommendations;
}

export function generateRecommendations(input: RecommendationInput): RecommendationSet {
  const { analysisResults, chatHistory, currentSeason } = input;

  // Sort analysis results by recency
  const sortedResults = sortByRecency(analysisResults);

  // Extract recommendations from analysis results and chat history
  const businessRecommendations = extractBusinessRecommendations(sortedResults);
  const forecastRecommendations = extractForecastRecommendations(sortedResults);
  const optimizationRecommendations = extractOptimizationRecommendations(sortedResults);
  const chatInsights = extractChatInsights(chatHistory);

  // Combine and deduplicate recommendations
  const allRecommendations = [...businessRecommendations, ...forecastRecommendations, ...optimizationRecommendations, ...chatInsights];
  const uniqueRecommendations = Array.from(new Set(allRecommendations.map(rec => rec.id)))
    .map(id => allRecommendations.find(rec => rec.id === id))
    .filter((rec): rec is RecommendationItem => rec !== undefined);

  // Add seasonal recommendations
  const finalRecommendations = addSeasonalRecommendations(uniqueRecommendations, currentSeason);

  // Generate summary (placeholder implementation)
  const summary = `Based on your analysis results and chat history, we recommend the following actions for the ${currentSeason} season:`;

  return {
    id: '',
    userId: input.userId,
    recommendations: finalRecommendations,
    summary,
    createdAt: new Date(),
  };
}
