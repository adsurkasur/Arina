// Main app types

export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id?: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface AnalysisResult {
  id: string;
  user_id: string;
  type: 'business_feasibility' | 'demand_forecast' | 'optimization';
  data: any;
  created_at: string;
  updated_at: string;
}

// Database types for Supabase
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          photo_url?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          photo_url?: string | null;
        };
      };
      chat_conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: 'user' | 'assistant';
          content?: string;
        };
      };
      analysis_results: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          data: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          data: any;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          data?: any;
        };
      };
    };
  };
};
