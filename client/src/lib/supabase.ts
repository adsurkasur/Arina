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
  return await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
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
  return await supabase
    .from('chat_conversations')
    .update({ title })
    .eq('id', chatId);
};

export const deleteChat = async (chatId: string) => {
  // First delete chat messages
  await supabase
    .from('chat_messages')
    .delete()
    .eq('conversation_id', chatId);
  
  // Then delete the conversation
  return await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', chatId);
};

// Chat messages
export const getChatMessages = async (conversationId: string) => {
  return await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
};

export const addChatMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
  return await supabase
    .from('chat_messages')
    .insert([
      { conversation_id: conversationId, role, content }
    ]);
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
