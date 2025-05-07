export interface RecommendationItem {
  id: string;
  set_id: string;
  type: 'crop' | 'business' | 'resource' | 'market';
  title: string;
  description: string;
  confidence: number;
  data: any;
  source: 'analysis' | 'chat' | 'pattern' | 'seasonal';
  created_at: string;
}

export interface RecommendationSet {
  id: string;
  user_id: string;
  summary: string;
  created_at: string;
  items: RecommendationItem[];
}

export interface GenerateRecommendationsParams {
  userId: string;
  currentSeason?: 'spring' | 'summer' | 'fall' | 'winter';
}