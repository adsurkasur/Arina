import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// User management only
export const createUserProfile = async (userId: string, email: string, name: string) => {
  return await supabase
    .from('users')
    .insert([
      { id: userId, email, name }
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