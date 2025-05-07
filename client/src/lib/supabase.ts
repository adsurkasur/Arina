import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// User management
export const createUserProfile = async (userId: string, email: string, name: string) => {
  return await supabase
    .from('users')
    .insert([
      { id: userId, email, name }
    ]);
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
    
    if (!response.ok) {
      const errorData = await response.json();
      return { data: null, error: new Error(errorData.message || 'Failed to create conversation') };
    }
    
    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('Error creating chat:', error);
    return { data: null, error };
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
  return await supabase
    .from('analysis_results')
    .insert([
      { user_id: userId, type, data }
    ])
    .select()
    .single();
};

export const getAnalysisResults = async (userId: string, type?: string) => {
  let query = supabase
    .from('analysis_results')
    .select('*')
    .eq('user_id', userId);
  
  if (type) {
    query = query.eq('type', type);
  }
  
  return await query.order('created_at', { ascending: false });
};

export const deleteAnalysisResult = async (resultId: string) => {
  return await supabase
    .from('analysis_results')
    .delete()
    .eq('id', resultId);
};
