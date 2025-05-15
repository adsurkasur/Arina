import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// User management
export const createUserProfile = async (userId: string, email: string, name: string, photoURL?: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        id: userId, 
        email, 
        name,
        photo_url: photoURL 
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to create user profile') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error };
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    // Use the Express API
    const response = await fetch(`/api/users/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to fetch user profile') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
};

// Chat history
export const getChatHistory = async (userId: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch(`/api/conversations/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to fetch chat history') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return { data: null, error };
  }
};

export const createChat = async (userId: string, title: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch('/api/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, title }),
    });
    
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: 'Unable to parse error response' };
    }

    if (!response.ok) {
      // Handle specific database connection errors
      if (errorData.message?.includes('endpoint is disabled') || 
          errorData.message?.includes('Control plane request failed')) {
        return { 
          data: null, 
          error: new Error('Database connection is currently unavailable. Please try again later.'),
          retryable: true
        };
      }
      
      return { 
        data: null, 
        error: new Error(errorData.message || 'Failed to create conversation'),
        retryable: false
      };
    }
    
    return { data: errorData, error: null, retryable: false };
  } catch (error) {
    console.error('Error creating chat:', error);
    const isNetworkError = error instanceof TypeError && error.message.includes('Network');
    return { 
      data: null, 
      error: new Error(isNetworkError ? 'Network connection error. Please check your connection.' : 'An unexpected error occurred.'),
      retryable: isNetworkError
    };
  }
};

export const updateChatTitle = async (chatId: string, title: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch(`/api/conversations/${chatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to update conversation title') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error updating chat title:', error);
    return { data: null, error };
  }
};

export const deleteChat = async (chatId: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch(`/api/conversations/${chatId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      return { error: new Error(errorData.message || 'Failed to delete conversation') };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting chat:', error);
    return { error };
  }
};

// Chat messages
export const getChatMessages = async (conversationId: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch(`/api/messages/${conversationId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to fetch messages') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return { data: null, error };
  }
};

export const addChatMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ conversation_id: conversationId, role, content }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to add message') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error adding chat message:', error);
    return { data: null, error };
  }
};

// Analysis results
export const saveAnalysisResult = async (userId: string, type: string, data: any) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch('/api/analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId, type, data }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to save analysis result') };
    }
    
    const result = await response.json();
    return { data: result, error: null };
  } catch (error) {
    console.error('Error saving analysis result:', error);
    return { data: null, error };
  }
};

export const getAnalysisResults = async (userId: string, type?: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const url = type 
      ? `/api/analysis/${userId}?type=${encodeURIComponent(type)}`
      : `/api/analysis/${userId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to fetch analysis results') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching analysis results:', error);
    return { data: null, error };
  }
};

export const deleteAnalysisResult = async (resultId: string) => {
  try {
    // Use the Express API instead of Supabase directly
    const response = await fetch(`/api/analysis/${resultId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      return { error: new Error(errorData.message || 'Failed to delete analysis result') };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting analysis result:', error);
    return { error };
  }
};

// Recommendations
export const getRecommendations = async (userId: string) => {
  try {
    // Use the Express API
    const response = await fetch(`/api/recommendations/${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to fetch recommendations') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return { data: null, error };
  }
};

export const getRecommendationSet = async (setId: string) => {
  try {
    // Use the Express API
    const response = await fetch(`/api/recommendations/set/${setId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to fetch recommendation set') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching recommendation set:', error);
    return { data: null, error };
  }
};

export const generateRecommendations = async (userId: string, currentSeason?: 'spring' | 'summer' | 'fall' | 'winter') => {
  try {
    // Use the Express API
    const response = await fetch('/api/recommendations/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, currentSeason }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to generate recommendations') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return { data: null, error };
  }
};

export const deleteRecommendation = async (recommendationId: string) => {
  try {
    // Use the Express API
    const response = await fetch(`/api/recommendations/${recommendationId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok && response.status !== 204) {
      const errorData = await response.json().catch(() => ({}));
      return { error: new Error(errorData.message || 'Failed to delete recommendation') };
    }
    
    return { error: null };
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    return { error };
  }
};
