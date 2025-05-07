
import { Router } from 'express';
import { getGeminiResponse } from '../services/gemini-service';
import { supabase } from '../db';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages, selectedFeature, userId, conversationId } = req.body;
    
    // Get user context from Supabase
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    const memoryContext = {
      profile: userProfile,
      feature: selectedFeature
    };

    const response = await getGeminiResponse(messages, selectedFeature, memoryContext);
    
    // Store the assistant's response in Supabase
    if (conversationId) {
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: response
        });
    }

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
