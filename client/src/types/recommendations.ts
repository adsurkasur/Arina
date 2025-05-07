export interface RecommendationItem {
  id: string;
  set_id: string;
  type: 'crop' | 'business' | 'resource' | 'market';
  title: string;
  description: string;
  confidence: string; // Stored as string but represents a 0-1 score
  data: any; // Supporting data for the recommendation
  source: 'analysis' | 'chat' | 'pattern' | 'seasonal';
  created_at: string;
}

export interface RecommendationSet {
  id: string;
  user_id: string;
  summary: string;
  created_at: string;
  items?: RecommendationItem[]; // Optional items that may be included in responses
}

export interface GenerateRecommendationsParams {
  userId: string;
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
}