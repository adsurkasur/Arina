import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/theme";
import ReactMarkdown from "react-markdown";
import TextStreamingEffect from "./TextStreamingEffect";

interface ChatBubbleProps {
  message: ChatMessage;
  userName: string;
  userImage?: string;
  animate?: boolean;
}

export default function ChatBubble({ message, userName, userImage, animate = false }: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [showAnimation, setShowAnimation] = useState(animate && !isUser);
  
  // Only animate assistant messages that don't have an ID yet (new messages)
  const shouldAnimate = !isUser && animate && !message.id;
  
  // Disable animation after component mounts if it's an existing message
  useEffect(() => {
    if (message.id) {
      setShowAnimation(false);
    }
  }, [message.id]);
  
  return (
    <div className={cn("flex mb-4", isUser && "justify-end")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
          <Sprout className="h-4 w-4" />
        </div>
      )}
      
      <div
        className={cn(
          "p-3 shadow-sm max-w-[80%]",
          isUser
            ? "bg-primary text-white ml-3 chat-bubble-user"
            : "bg-white text-gray-800 ml-3 chat-bubble-bot"
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : shouldAnimate ? (
          <TextStreamingEffect 
            fullText={message.content} 
            speed={20} 
            onComplete={() => setShowAnimation(false)}
          />
        ) : (
          <ReactMarkdown
            className="prose prose-sm max-w-none"
            components={{
              a: ({ node, ...props }) => (
                <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc pl-5 my-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal pl-5 my-2" />
              ),
              li: ({ node, ...props }) => (
                <li {...props} className="my-1" />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mb-2" />
              ),
              code: ({ node, inline, ...props }) => (
                inline
                  ? <code {...props} className="bg-gray-100 p-0.5 rounded" />
                  : <pre className="bg-gray-100 p-2 rounded overflow-x-auto"><code {...props} /></pre>
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto">
                  <table {...props} className="border-collapse border border-gray-300 my-2" />
                </div>
              ),
              th: ({ node, ...props }) => (
                <th {...props} className="border border-gray-300 p-2 bg-gray-100" />
              ),
              td: ({ node, ...props }) => (
                <td {...props} className="border border-gray-300 p-2" />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
      
      {isUser && (
        <Avatar className="w-8 h-8 ml-3 flex-shrink-0">
          <AvatarImage src={userImage} alt={userName} />
          <AvatarFallback className="bg-gray-200 text-gray-700">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
