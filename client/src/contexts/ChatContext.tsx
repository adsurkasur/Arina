import React, { createContext, useState, useCallback, useEffect } from "react";
import type { ReactNode } from "react";
import { ChatConversation, ChatMessage } from "@/types";
import {
  createChatSession,
  sendMessage as sendGeminiMessage,
} from "@/lib/gemini";
import {
  getChatHistory,
  createChat,
  updateChatTitle,
  deleteChat,
  getChatMessages,
  addChatMessage,
} from "@/lib/mongodb";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisHistory } from "@/hooks/useAnalysisHistory";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { useTranslation } from "react-i18next";

interface ChatContextProps {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  createNewChat: () => Promise<ChatConversation>;
  loadConversation: (conversationId: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  renameConversation: (conversationId: string, title: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  loadChatHistory: () => Promise<void>;
  clearActiveConversation: () => void;
}

export const ChatContext = createContext<ChatContextProps>({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  createNewChat: async () => ({}) as ChatConversation,
  loadConversation: async () => {},
  sendMessage: async () => {},
  renameConversation: async () => {},
  deleteConversation: async () => {},
  loadChatHistory: async () => {},
  clearActiveConversation: () => {},
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState([] as ChatConversation[]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState([] as ChatMessage[]);
  const [chatSession, setChatSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { analysisResults } = useAnalysisHistory();
  const { t } = useTranslation();

  // Load chat history when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadChatHistory();
    }
  }, [isAuthenticated, user]);

  const loadChatHistory = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const { data, error } = await getChatHistory(user.id);
      if (error) throw error;
      if (data) {
        setConversations((_prev: ChatConversation[]) => data);
      }
    } catch (error: any) {
      console.error("Error loading chat history:", error);
      toast({
        title: t("chatContext.errorLoadingHistoryTitle"),
        description: error.message || t("chatContext.errorLoadingHistoryDesc"),
        variant: "destructive",
      });
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast, t]);

  const createNewChat = useCallback(async () => {
    if (!user) throw new Error(t("chatContext.errorUserNotAuthenticated"));
    try {
      // Ensure user exists in database first
      const API_BASE = getApiBaseUrl();
      const userResponse = await fetch(`${API_BASE}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          photo_url: user.photoURL,
        }),
      });

      // Check if response is ok and has content
      if (!userResponse.ok) {
        throw new Error(`HTTP error! status: ${userResponse.status}`);
      }

      // Only try to parse JSON if there's content
      const contentType = userResponse.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await userResponse.text();
        if (text) {
          JSON.parse(text); // Validate JSON
        }
      }

      const { data, error } = await createChat(user.id, "New Conversation");

      if (error) throw error;

      if (data) {
        const newConversation = data;
        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        setMessages([]);

        // Initialize Gemini chat session
        const session = await createChatSession();
        setChatSession(session);

        return newConversation;
      }

      throw new Error(t("chatContext.errorCreateNewChat"));
    } catch (error: any) {
      toast({
        title: t("chatContext.errorCreateNewChatTitle"),
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast, t]);

  const loadConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        const conversation = conversations.find((c: ChatConversation) => c.id === conversationId);
        if (!conversation) throw new Error(t("chatContext.errorConversationNotFound"));
        setActiveConversation(conversation);
        const { data, error } = await getChatMessages(conversationId);
        if (error) throw error;
        if (data) {
          setMessages((_prev: ChatMessage[]) => data);
          try {
            const chatMessages = data.map((msg: ChatMessage) => ({
              role: msg.role === "assistant" ? "model" : msg.role,
              content: msg.content,
            }));
            const session = await createChatSession(chatMessages);
            if (!session) {
              throw new Error(t("chatContext.errorCreateSession"));
            }
            setChatSession(session);
          } catch (error) {
            console.error("Error initializing chat session:", error);
            toast({
              title: t("chatContext.errorChatTitle"),
              description: t("chatContext.errorChatDesc"),
              variant: "destructive",
            });
          }
        }
      } catch (error: any) {
        toast({
          title: t("chatContext.errorLoadingConversationTitle"),
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [conversations, toast, t],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || !chatSession) {
        try {
          const newConversation = await createNewChat();
          await _sendMessage(newConversation.id, content);
        } catch (error) {
          toast({
            title: t("chatContext.errorSendMessageTitle"),
            description: t("chatContext.errorSendMessageDesc"),
            variant: "destructive",
          });
        }
        return;
      }
      await _sendMessage(activeConversation.id, content);
    },
    [activeConversation, chatSession, createNewChat, toast, t],
  );

  // Internal function to handle message sending
  const _sendMessage = async (conversationId: string, content: string) => {
    try {
      setIsSending(true);
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        conversation_id: conversationId,
        role: "user",
        content,
        sender_id: user?.id || "",
      };
      setMessages((prev: ChatMessage[]) => [...prev, userMessage]);
      // Save user message to database
      await addChatMessage(conversationId, "user", content, user?.id || "");
      // Wait for AI response with proper error handling
      let aiResponse: string = "";
      try {
        // Include analysis history for context if available
        aiResponse = await sendGeminiMessage(
          chatSession,
          content,
          analysisResults,
        );
        if (!aiResponse) {
          console.error("Chat response is null:", {
            chatSession,
            content,
            analysisResults: analysisResults?.length,
          });
          throw new Error(t("chatContext.errorEmptyModelResponse"));
        }
        // Add AI response to UI
        const assistantMessage: ChatMessage = {
          conversation_id: conversationId,
          role: "assistant",
          content: aiResponse,
          sender_id: "assistant",
        };
        setMessages((prev: ChatMessage[]) => [...prev, assistantMessage]);
        // Save assistant message to database
        await addChatMessage(conversationId, "assistant", aiResponse, "assistant");
        return aiResponse;
      } catch (error: any) {
        if (error.status === 429) {
          // Rate limit exceeded
          const errorMessage: ChatMessage = {
            conversation_id: conversationId,
            role: "assistant",
            content: t("chatContext.errorRateLimit"),
            sender_id: "assistant",
          };
          setMessages((prev: ChatMessage[]) => [...prev, errorMessage]);
          return;
        }
        // Handle other errors
        const errorMessage: ChatMessage = {
          conversation_id: conversationId,
          role: "assistant",
          content: t("chatContext.errorProcessingRequest"),
          sender_id: "assistant",
        };
        setMessages((prev: ChatMessage[]) => [...prev, errorMessage]);
        return errorMessage.content;
      }
      // Save assistant message to database
      await addChatMessage(conversationId, "assistant", aiResponse, "assistant");
      // Update conversation title if it's the first message
      if (
        messages.length === 0 &&
        activeConversation?.title === t("chatContext.newConversationTitle")
      ) {
        const newTitle =
          content.length > 30 ? content.substring(0, 30) + "..." : content;
        await renameConversation(conversationId, newTitle);
      }
    } catch (error: any) {
      toast({
        title: t("chatContext.errorSendMessageTitle"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const renameConversation = useCallback(
    async (conversationId: string, title: string) => {
      try {
        const { error } = await updateChatTitle(conversationId, title);
        if (error) throw error;
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId ? { ...conv, title } : conv,
          ),
        );
        if (activeConversation?.id === conversationId) {
          setActiveConversation((prev) => (prev ? { ...prev, title } : null));
        }
        toast({
          title: t("chatContext.conversationRenamedTitle"),
          description: t("chatContext.conversationRenamedDesc"),
        });
      } catch (error: any) {
        toast({
          title: t("chatContext.errorRenamingConversationTitle"),
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [activeConversation, toast, t],
  );

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        const { error } = await deleteChat(conversationId);
        if (error) throw error;
        setConversations((prev) =>
          prev.filter((conv) => conv.id !== conversationId),
        );
        if (activeConversation?.id === conversationId) {
          setActiveConversation(null);
          setMessages([]);
          setChatSession(null);
        }
        toast({
          title: t("chatContext.conversationDeletedTitle"),
          description: t("chatContext.conversationDeletedDesc"),
        });
      } catch (error: any) {
        toast({
          title: t("chatContext.errorDeletingConversationTitle"),
          description: error.message,
          variant: "destructive",
        });
      }
    },
    [activeConversation, toast, t],
  );

  const clearActiveConversation = useCallback(() => {
    setActiveConversation(null);
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        isLoading,
        isSending,
        createNewChat,
        loadConversation,
        sendMessage,
        renameConversation,
        deleteConversation,
        loadChatHistory,
        clearActiveConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
