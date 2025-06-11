import { GoogleGenerativeAI } from "@google/generative-ai";
import i18n from '../i18n';
import promptsRaw from './prompts.json';

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Default model
const defaultModelName = "gemini-2.5-flash-preview-05-20"; 

// Chat history interface
export interface ChatMessage {
  role: "user" | "model" | "function" | "system";
  content: string;
}

// Create a chat session
export const createChatSession = async (history: ChatMessage[] = []) => {
  if (!apiKey) {
    throw new Error(i18n.t('error.gemini_api_key_not_configured'));
  }

  const model = genAI.getGenerativeModel({ model: defaultModelName });
  
  try {
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096, // Increased tokens for longer answers
      },
    });
    return chat;
  } catch (error) {
    console.error(i18n.t('error.creating_chat_session'), error);
    const errorMessage = (typeof error === "object" && error !== null && "message" in error)
      ? (error as { message?: string }).message
      : String(error);
    throw new Error(i18n.t('error.failed_to_initialize_chat_session', { message: errorMessage }));
  }
};

// --- GENERAL CHAT FUNCTION (Updated) ---
export const sendMessage = async (
  chat: any,
  message: string,
  analysisHistory: any[] = [],
  retries = 3,
  delay = 1000,
): Promise<string> => {
  // Use prompt from prompts.json
  const simpleSystemPrompt = prompts.simple_system;

  if (!chat) {
    throw new Error(i18n.t('error.chat_not_initialized'));
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error(i18n.t('error.invalid_message'));
  }

  try {
    let finalMessage = message;
    // Use context from prompts.json
    if (analysisHistory && analysisHistory.length > 0) {
      const historyCount = Math.min(analysisHistory.length, 2);
      const contextPrefix = prompts.context_prefix;
      const analysisContext = analysisHistory
        .slice(0, historyCount)
        .map((analysis, i) =>
          prompts.analysis_context
            .replace('{{type}}', analysis.type)
            .replace('{{date}}', new Date(analysis.created_at).toLocaleDateString('en-US'))
        )
        .join('\n');
      finalMessage = `${contextPrefix}${analysisContext}\n\n${prompts.user_message}: ${message}`;
    }
    // Combine the simple prompt with the user message
    const messageToSend = `${simpleSystemPrompt}\n\n---\n\n${finalMessage}`;
    const result = await chat.sendMessage(messageToSend);
    const response = await result.response.text();
    return response.trim() || i18n.t('error.no_response');
  } catch (error: any) {
    console.error(i18n.t('error.sending_message'), error);
    if (error.status === 429) {
      return i18n.t('error.server_busy');
    }
    return i18n.t('error.general');
  }
};


// --- NEW FUNCTION (For Detailed Analysis) ---
// This function uses your previous detailed prompt, specifically for generating reports.
export const generateAnalysisResponse = async (
  analysisType: string,
  data: any,
  analysisHistory: any[] = []
): Promise<string> => {
  // Use prompt from prompts.json
  const detailedSystemPrompt = prompts.detailed_system.replace('{{analysisType}}', analysisType);

  let fullPrompt = `${detailedSystemPrompt}\n\n${prompts.data_to_analyze}\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;

  if (analysisHistory && analysisHistory.length > 0) {
    const historyContext = analysisHistory
      .map((item, index) => `${prompts.analysis_history.replace('{{index}}', (index + 1).toString()).replace('{{type}}', item.type)}\n\`\`\`json\n${JSON.stringify(item.data, null, 2)}\n\`\`\``)
      .join("\n\n");
    fullPrompt += `\n\n${prompts.context_from_previous_analysis}\n${historyContext}`;
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: defaultModelName });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response.text();
    return response.trim();
  } catch (error) {
    console.error("Error generating analysis response:", error);
    return i18n.t('error.analysis_failed');
  }
};

const prompts: Record<string, string> = promptsRaw as Record<string, string>;