
import { Router } from 'express';
import { supabase } from '../db';
import { getGeminiResponse } from '../services/gemini-service';

const router = Router();

router.post('/chat', async (req, res) => {
  try {
    const { messages, selectedFeature, userId } = req.body;
    
    // Get user context from Supabase
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    const memoryContext = {
      profile: userProfile,
      // Add any other context you want to include
    };

    const response = await getGeminiResponse(messages, selectedFeature, memoryContext);
    
    // Store the conversation in Supabase
    await supabase.from('chat_messages').insert({
      user_id: userId,
      role: 'assistant',
      content: response,
      feature: selectedFeature
    });

    res.json({ response });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

export default router;
