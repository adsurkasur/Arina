import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// Default model is Gemini 1.0 Pro
const defaultModelName = "gemini-1.0-pro";

// Chat history interface
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Create a chat session
export const createChatSession = async (history: ChatMessage[] = []) => {
  try {
    const model = genAI.getGenerativeModel({ model: defaultModelName });
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });
    
    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};

// Send a message and get a response
export const sendMessage = async (chat: any, message: string): Promise<string> => {
  try {
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

// Generate a single response (no chat history)
export const generateResponse = async (prompt: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: defaultModelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
};

// Helper to create an agricultural analysis prompt
export const createAnalysisPrompt = (analysisType: string, data: any): string => {
  let prompt = `You are an agricultural business advisor. Please provide a detailed analysis for the following ${analysisType} data:\n\n`;
  
  prompt += JSON.stringify(data, null, 2);
  
  prompt += `\n\nPlease provide a professional analysis including key insights, recommendations, and potential risks. Format the response in clear sections.`;
  
  return prompt;
};
