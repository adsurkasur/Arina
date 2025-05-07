import { ChatMessage } from "@/types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Default model is Gemini 1.0 Pro
const defaultModelName = "gemini-1.5-pro";

// Chat history interface
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const API_URL = '/api/chat';

export const createChatSession = async (history: ChatMessage[] = []) => {
  return { history }; // Simplified session object
};

export const sendMessage = async (
  chat: any,
  message: string,
  feature: string = 'general'
): Promise<string> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [...(chat.history || []), { role: 'user', content: message }],
        selectedFeature: feature
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.response;
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
export const createAnalysisPrompt = (
  analysisType: string,
  data: any,
): string => {
  let prompt = `You are an agricultural business advisor. Please provide a detailed analysis for the following ${analysisType} data:\n\n`;

  prompt += JSON.stringify(data, null, 2);

  prompt += `\n\nPlease provide a professional analysis including key insights, recommendations, and potential risks. Format the response in clear sections.`;

  return prompt;
};