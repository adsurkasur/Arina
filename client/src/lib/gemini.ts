import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Default model
const defaultModelName = "gemini-2.0-flash-exp";

// Chat history interface
export interface ChatMessage {
  role: "user" | "model" | "function" | "system";
  content: string;
}

// Create a chat session
export const createChatSession = async (history: ChatMessage[] = []) => {
  if (!apiKey) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: defaultModelName });
  
  try {
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : msg.role,
        parts: [{ text: msg.content }],
      })),
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
    });

    // Validate chat session by sending a test message
    await chat.sendMessage("test");
    
    return chat;
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw new Error("Failed to initialize chat session: " + (error.message || error));
  }
};

// Send a message and get a response
export const sendMessage = async (
  chat: any,
  message: string,
  analysisHistory: any[] = [],
  retries = 3,
  delay = 1000,
): Promise<string> => {
  // Improved system prompt for more focused responses
  const systemPrompt = `You are Arina, an AI assistant specializing in agricultural business analysis. 
  Focus on providing clear, actionable insights based on data and agricultural expertise. 
  Keep responses concise and relevant to the agricultural business context.
  If analyzing numbers, show your calculations and reasoning.`;
  
  // Combine system prompt with user message
  const enhancedMessage = `${systemPrompt}\n\nUser query: ${message}`;
  if (!chat) {
    throw new Error('Chat session is not initialized');
  }

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    throw new Error('Invalid message');
  }

  try {
    // Add analysis history context if available
    let finalMessage = message;
    
    if (analysisHistory && analysisHistory.length > 0) {
      // Check length of history to decide how many items to include to stay within token limits
      const historyCount = Math.min(analysisHistory.length, 2); // Limit to 2 most recent analyses
      
      // Add a system-level context prefix about analysis history
      const contextPrefix = `I have access to your previous analysis results and will reference them when relevant. `;
      
      // Prepare detailed context about analyses (only for the first message in a conversation)
      if (message.length < 500) { // Only add detailed context for shorter messages to avoid token limits
        const analysisContext = analysisHistory
          .slice(0, historyCount)
          .map((analysis, i) => {
            const date = analysis.created_at ? new Date(analysis.created_at).toLocaleDateString() : 'recent';
            return `[Analysis ${i+1}] Type: ${analysis.type} (${date})`;
          })
          .join('\n');
          
        finalMessage = `${contextPrefix}\n\nUser analysis history summary:\n${analysisContext}\n\nUser message: ${message}`;
      } else {
        // For longer messages, just add a brief context note
        finalMessage = `${contextPrefix}\n\nUser message: ${message}`;
      }
    }
    
    console.log('Sending message to Gemini:', finalMessage);
    const result = await chat.sendMessage(finalMessage.trim());
    console.log('Raw Gemini response:', result);

    if (!result) {
      console.error('Gemini API returned null result');
      return "I apologize, but I couldn't process your message. Please try again.";
    }

    const response = await result.response.text();
    
    if (!response) {
      return "Sorry, I couldn't process your message. Please try again.";
    }

    // Clean and format response
    const cleanResponse = response
      .replace(/undefined|Hllo!/g, '')
      .replace(/(Hello!|Hi!) How can I help you.*?(\?|$)/, 'Hi!')
      .replace(/\s+/g, ' ')
      .trim();

    return cleanResponse || "Sorry, I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("Error sending message:", error);

    // Check if it's a rate limit error (429)
    if (error.status === 429 && retries > 0) {
      // Extract retry delay from error response if available
      let retryDelay = delay;

      try {
        // Parse the errorDetails from the response
        if (error.errorDetails && Array.isArray(error.errorDetails)) {
          // Find RetryInfo object in error details
          const retryInfo = error.errorDetails.find((detail: any) =>
            detail["@type"]?.includes("RetryInfo"),
          );

          if (retryInfo && retryInfo.retryDelay) {
            // Convert "30s" to milliseconds
            const seconds = retryInfo.retryDelay.replace("s", "");
            retryDelay = parseInt(seconds) * 1000 || delay;
          }
        }
      } catch (parseError) {
        console.error("Error parsing retry delay:", parseError);
      }

      console.log(`Rate limit hit, waiting ${retryDelay}ms before retry...`);

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Retry with exponential backoff
      return sendMessage(chat, message, analysisHistory, retries - 1, delay * 2);
    }

    if (error.status === 429) {
      let waitTime = "a few moments";
      try {
        // Extract retry delay from error response
        const retryInfo = error.errorDetails?.find((detail: any) =>
          detail["@type"]?.includes("RetryInfo"),
        );
        if (retryInfo?.retryDelay) {
          waitTime = retryInfo.retryDelay.replace("s", " seconds");
        }
      } catch (e) {
        console.error("Error parsing retry info:", e);
      }
      return `I'm currently experiencing high demand. Please wait ${waitTime} before trying again. This is due to API rate limits.`;
    }

    return "I apologize, but I couldn't process your message at this time. Please try again.";
  }
};

// Generate a single response (no chat history)
export const generateResponse = async (
  prompt: string,
  retries = 3,
  delay = 1000,
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: defaultModelName });
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error: any) {
    console.error("Error generating response:", error);

    // Check if it's a rate limit error (429)
    if (error.status === 429 && retries > 0) {
      // Extract retry delay from error response if available
      let retryDelay = delay;

      try {
        // Parse the errorDetails from the response
        if (error.errorDetails && Array.isArray(error.errorDetails)) {
          // Find RetryInfo object in error details
          const retryInfo = error.errorDetails.find((detail: any) =>
            detail["@type"]?.includes("RetryInfo"),
          );

          if (retryInfo && retryInfo.retryDelay) {
            // Convert "30s" to milliseconds
            const seconds = retryInfo.retryDelay.replace("s", "");
            retryDelay = parseInt(seconds) * 1000 || delay;
          }
        }
      } catch (parseError) {
        console.error("Error parsing retry delay:", parseError);
      }

      console.log(`Rate limit hit, waiting ${retryDelay}ms before retry...`);

      // Wait for the specified delay
      await new Promise((resolve) => setTimeout(resolve, retryDelay));

      // Retry with exponential backoff
      return generateResponse(prompt, retries - 1, delay * 2);
    }

    if (error.status === 429) {
      return "I'm currently experiencing high demand. Please try again in a few moments.";
    }

    return "I'm sorry, I couldn't generate a response. Please try again.";
  }
};

// Helper to create an agricultural analysis prompt
export const createAnalysisPrompt = (
  analysisType: string,
  data: any,
  analysisHistory: any[] = [],
): string => {
  let prompt = `You are an agricultural business advisor. Please provide a detailed analysis for the following ${analysisType} data:\n\n`;

  prompt += JSON.stringify(data, null, 2);

  // Add analysis history for context if available
  if (analysisHistory && analysisHistory.length > 0) {
    prompt += `\n\nFor context, here are previous analysis results that may be relevant:\n\n`;
    
    // Add up to 3 most recent analysis results for context
    const recentHistory = analysisHistory.slice(0, 3);
    
    recentHistory.forEach((analysis, index) => {
      prompt += `Analysis ${index + 1} (${analysis.type}):\n`;
      prompt += JSON.stringify(analysis.data, null, 2);
      prompt += '\n\n';
    });
  }

  prompt += `\n\nPlease provide a professional analysis including key insights, recommendations, and potential risks. Format the response in clear sections.`;
  
  // If there's history, ask to incorporate it
  if (analysisHistory && analysisHistory.length > 0) {
    prompt += `\nIncorporate insights from previous analyses where relevant, showing how the current analysis relates to past findings.`;
  }

  return prompt;
};
