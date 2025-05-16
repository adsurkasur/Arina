
import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessage } from "@/types";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import ThinkingAnimation from "./ThinkingAnimation";
import { Button } from "../ui/button";
import { MessageSquarePlus } from "lucide-react";

export default function ChatInterface() {
  const { messages, isLoading, sendMessage, isSending, activeConversation, createNewChat } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [lastMessageAnimated, setLastMessageAnimated] = useState<string | null>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSending) {
      setShowThinking(false);
      timer = setTimeout(() => {
        setShowThinking(true);
      }, 2000);
    } else {
      setShowThinking(false);
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [isSending]);
  
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length-1].role === 'assistant') {
      const lastMsg = messages[messages.length-1];
      if (lastMsg.content && !lastMessageAnimated) {
        setLastMessageAnimated(lastMsg.content);
      }
    }
  }, [messages, lastMessageAnimated]);
  
  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessage(content);
      setLastMessageAnimated(null);
    }
  };
  
  const shouldAnimateMessage = (message: ChatMessage, index: number) => {
    return message.role === 'assistant' && 
           index === messages.length - 1 && 
           message.content === lastMessageAnimated;
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-background">
        <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Arina</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          Your AI-powered agricultural business assistant. Start a new conversation to get insights and recommendations.
        </p>
        <Button 
          onClick={createNewChat}
          size="lg"
          className="gap-2"
        >
          <MessageSquarePlus className="w-5 h-5" />
          Start New Chat
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" id="chatMessages">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <p>Start a new conversation by typing a message below.</p>
            </div>
          </div>
        ) : (
          <div className="w-full px-4">
            {messages.map((message: ChatMessage, index: number) => (
              <ChatBubble 
                key={message.id || index} 
                message={message} 
                userName={user?.name || "User"}
                userImage={user?.photoURL}
                animate={shouldAnimateMessage(message, index)}
              />
            ))}
            {isSending && (
              showThinking ? <ThinkingAnimation /> : <TypingIndicator />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
    </>
  );
}
