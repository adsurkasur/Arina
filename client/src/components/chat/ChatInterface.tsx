import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessage } from "@/types";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import ThinkingAnimation from "./ThinkingAnimation";

export default function ChatInterface() {
  const { messages, isLoading, sendMessage, isSending } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [lastMessageAnimated, setLastMessageAnimated] = useState<string | null>(null);
  
  // Scroll to bottom when new messages arrive or when typing indicator appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);
  
  // Show the more advanced thinking animation after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSending) {
      // Initially show the typing indicator
      setShowThinking(false);
      
      // After 2 seconds, switch to the thinking animation for longer responses
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
  
  // Keep track of which message was last animated to prevent re-animating
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
      // Reset animation tracking when sending a new message
      setLastMessageAnimated(null);
    }
  };
  
  // Check if a message should be animated
  const shouldAnimateMessage = (message: ChatMessage, index: number) => {
    return message.role === 'assistant' && 
           index === messages.length - 1 && 
           message.content === lastMessageAnimated;
  };
  
  return (
    <>
      {/* Chat Messages */}
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
      
      {/* Chat Input */}
      <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
    </>
  );
}
