
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';
import { ChatMessage, ChatConversation } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Chat functions
export const createChat = async (userId: string, title: string) => {
  return await supabase
    .from('chat_conversations')
    .insert([{ user_id: userId, title }])
    .select()
    .single();
};

export const getChatHistory = async (userId: string) => {
  return await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
};

export const getChatMessages = async (conversationId: string) => {
  return await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
};

export const addChatMessage = async (
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
) => {
  return await supabase
    .from('chat_messages')
    .insert([{ conversation_id: conversationId, role, content }])
    .select()
    .single();
};

export const updateChatTitle = async (conversationId: string, title: string) => {
  return await supabase
    .from('chat_conversations')
    .update({ title, updated_at: new Date() })
    .eq('id', conversationId);
};

export const deleteChat = async (conversationId: string) => {
  return await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId);
};

// User management
export const createUserProfile = async (userId: string, email: string, name: string) => {
  return await supabase
    .from('users')
    .insert([{ id: userId, email, name }]);
};

// Analysis results
export const saveAnalysisResult = async (userId: string, type: string, data: any) => {
  return await supabase
    .from('analysis_results')
    .insert([{ user_id: userId, type, data }])
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
