import React, { createContext, useState, useCallback, useEffect } from "react";
import { ChatConversation, ChatMessage } from "@/types";
import { createChatSession, sendMessage as sendGeminiMessage } from "@/lib/gemini";
import { 
  getChatHistory, 
  createChat, 
  updateChatTitle, 
  deleteChat, 
  getChatMessages, 
  addChatMessage 
} from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
}

export const ChatContext = createContext<ChatContextProps>({
  conversations: [],
  activeConversation: null,
  messages: [],
  isLoading: false,
  isSending: false,
  createNewChat: async () => ({} as ChatConversation),
  loadConversation: async () => {},
  sendMessage: async () => {},
  renameConversation: async () => {},
  deleteConversation: async () => {},
  loadChatHistory: async () => {},
});

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSession, setChatSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

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
        setConversations(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading chat history",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const createNewChat = useCallback(async () => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // Ensure user exists in database first
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          name: user.name,
          photo_url: user.photoURL
        })
      });

      const { data, error } = await createChat(user.id, "New Conversation");
      
      if (error) throw error;
      
      if (data) {
        const newConversation = data;
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        setMessages([]);
        
        // Initialize Gemini chat session
        const session = await createChatSession();
        setChatSession(session);
        
        return newConversation;
      }
      
      throw new Error("Failed to create new chat");
    } catch (error: any) {
      toast({
        title: "Error creating new chat",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  }, [user, toast]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true);
      
      // Find the conversation in the state
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) throw new Error("Conversation not found");
      
      setActiveConversation(conversation);
      
      // Load messages for this conversation
      const { data, error } = await getChatMessages(conversationId);
      
      if (error) throw error;
      
      if (data) {
        setMessages(data);
        
        // Initialize Gemini chat session with history
        const chatMessages = data.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        const session = await createChatSession(chatMessages);
        setChatSession(session);
      }
    } catch (error: any) {
      toast({
        title: "Error loading conversation",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversations, toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversation || !chatSession) {
      // Create a new conversation if none is active
      try {
        const newConversation = await createNewChat();
        await _sendMessage(newConversation.id, content);
      } catch (error) {
        toast({
          title: "Error sending message",
          description: "Failed to create a new conversation",
          variant: "destructive",
        });
      }
      return;
    }
    
    await _sendMessage(activeConversation.id, content);
  }, [activeConversation, chatSession, createNewChat, toast]);
  
  // Internal function to handle message sending
  const _sendMessage = async (conversationId: string, content: string) => {
    try {
      setIsSending(true);
      
      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        conversation_id: conversationId,
        role: 'user',
        content
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Save user message to database
      await addChatMessage(conversationId, 'user', content);
      
      // Wait for AI response with proper error handling
      try {
        const response = await sendGeminiMessage(chatSession, content);
        
        if (!response) {
          throw new Error("Empty response from model");
        }
        
        // Add AI response to UI
        const assistantMessage: ChatMessage = {
          conversation_id: conversationId,
          role: 'assistant',
          content: response
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Save assistant message to database
        await addChatMessage(conversationId, 'assistant', response);
      } catch (error: any) {
        if (error.status === 429) {
          // Rate limit exceeded
          const errorMessage: ChatMessage = {
            conversation_id: conversationId,
            role: 'assistant',
            content: "I'm receiving too many requests right now. Please wait a moment before trying again."
          };
          setMessages(prev => [...prev, errorMessage]);
          return;
        }
        
        // Handle other errors
        const errorMessage: ChatMessage = {
          conversation_id: conversationId,
          role: 'assistant',
          content: "Sorry, I encountered an error. Please try again later."
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }
      
      // Save assistant message to database
      await addChatMessage(conversationId, 'assistant', response);
      
      // Update conversation title if it's the first message
      if (messages.length === 0 && activeConversation?.title === "New Conversation") {
        const newTitle = content.length > 30 ? content.substring(0, 30) + "..." : content;
        await renameConversation(conversationId, newTitle);
      }
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const renameConversation = useCallback(async (conversationId: string, title: string) => {
    try {
      const { error } = await updateChatTitle(conversationId, title);
      
      if (error) throw error;
      
      // Update conversations list
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId ? { ...conv, title } : conv
        )
      );
      
      // Update active conversation if needed
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => prev ? { ...prev, title } : null);
      }
      
      toast({
        title: "Conversation renamed",
        description: "The conversation has been renamed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error renaming conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [activeConversation, toast]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await deleteChat(conversationId);
      
      if (error) throw error;
      
      // Remove from state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      // Clear active conversation if it was deleted
      if (activeConversation?.id === conversationId) {
        setActiveConversation(null);
        setMessages([]);
        setChatSession(null);
      }
      
      toast({
        title: "Conversation deleted",
        description: "The conversation has been deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error deleting conversation",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [activeConversation, toast]);

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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
