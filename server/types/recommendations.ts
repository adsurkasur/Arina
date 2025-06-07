// Types for recommendations, analysis, and user settings shared between client and server
// This file contains only TypeScript types/interfaces, no Drizzle or Zod code

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

export interface AnalysisResult {
  id: string;
  user_id: string;
  type: string;
  data: any;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'id';
  createdAt: Date;
  updatedAt: Date;
}
