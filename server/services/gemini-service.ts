
import { ChatMessage } from '@shared/schema';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const getGeminiResponse = async (
  messages: ChatMessage[],
  selectedFeature: string = 'general',
  memoryContext?: any
) => {
  try {
    // Transform messages to Gemini format
    const geminiMessages = messages.map(message => ({
      role: message.role === 'user' ? 'user' : 'model',
      parts: [{ text: message.content }]
    }));

    // Create system message based on feature
    const systemMessage = createSystemMessage(selectedFeature, memoryContext);
    
    const fullConversation = [
      {
        role: 'model',
        parts: [{ text: systemMessage }]
      },
      ...geminiMessages
    ];

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: fullConversation,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           'Sorry, I couldn\'t generate a response.';
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
};

function createSystemMessage(feature: string, memoryContext?: any): string {
  // Implementation from your pasted code
  let systemMessage = 'You are Arina, a highly specialized AI business assistant. ';
  
  // Add feature-specific task description
  const taskDescription = getTaskDescription(feature);
  systemMessage += taskDescription;
  
  // Add memory context if available
  if (memoryContext) {
    systemMessage += formatMemoryContext(memoryContext);
  }
  
  return systemMessage;
}

function getTaskDescription(feature: string): string {
  const descriptions: Record<string, string> = {
    'feasibility': 'Your ONLY task is feasibility analysis...',
    'forecasting': 'Your ONLY task is business forecasting...',
    // Add other features as needed
    'general': 'You are a general business assistant...'
  };
  
  return descriptions[feature] || descriptions.general;
}

function formatMemoryContext(context: any): string {
  let memoryString = "\n\nUser Memory Context:";
  
  if (context.profile) {
    memoryString += `\n- Business: ${context.profile.business_name || 'Unknown'}`;
    memoryString += `\n- Business Type: ${context.profile.business_type || 'Unknown'}`;
    // Add other profile information
  }
  
  return memoryString;
}
