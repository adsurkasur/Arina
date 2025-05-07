import { useEffect, useRef } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessage } from "@/types";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import WelcomeBanner from "./WelcomeBanner";

export default function ChatInterface() {
  const { messages, isLoading, sendMessage, isSending } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessage(content);
    }
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
          <WelcomeBanner />
        ) : (
          <div className="max-w-2xl mx-auto">
            {messages.map((message: ChatMessage, index: number) => (
              <ChatBubble 
                key={message.id || index} 
                message={message} 
                userName={user?.name || "User"}
                userImage={user?.photoURL}
              />
            ))}
            {isSending && (
              <div className="flex mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                  <span className="text-lg">A</span>
                </div>
                <div className="ml-3 bg-white p-3 rounded-tr-lg rounded-br-lg rounded-bl-lg shadow-sm max-w-[80%]">
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  </div>
                </div>
              </div>
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
