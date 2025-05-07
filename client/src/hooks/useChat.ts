import { useContext } from "react";
import { ChatContext } from "@/contexts/ChatContext";

// Using Express API directly for chat operations
const getChatHistory = async (userId: string) => {
  const response = await fetch(`/api/conversations/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch chat history');
  return await response.json();
};

const createChat = async (userId: string, title: string) => {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, title })
  });
  if (!response.ok) throw new Error('Failed to create chat');
  return await response.json();
};

const getChatMessages = async (conversationId: string) => {
  const response = await fetch(`/api/messages/${conversationId}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  return await response.json();
};

const addChatMessage = async (conversationId: string, role: string, content: string) => {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conversation_id: conversationId, role, content })
  });
  if (!response.ok) throw new Error('Failed to add message');
  return await response.json();
};


export const useChat = () => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }

  return {
    getChatHistory,
    createChat,
    getChatMessages,
    addChatMessage
  };
};