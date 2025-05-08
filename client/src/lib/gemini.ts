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
  try {
    const model = genAI.getGenerativeModel({ model: defaultModelName });
    const chat = model.startChat({
      history: history.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
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
export const sendMessage = async (
  chat: any,
  message: string,
  retries = 3,
  delay = 1000,
): Promise<string> => {
  try {
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
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
      return sendMessage(chat, message, retries - 1, delay * 2);
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

    return "I'm sorry, I couldn't process your message. Please try again.";
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
): string => {
  let prompt = `You are an agricultural business advisor. Please provide a detailed analysis for the following ${analysisType} data:\n\n`;

  prompt += JSON.stringify(data, null, 2);

  prompt += `\n\nPlease provide a professional analysis including key insights, recommendations, and potential risks. Format the response in clear sections.`;

  return prompt;
};
