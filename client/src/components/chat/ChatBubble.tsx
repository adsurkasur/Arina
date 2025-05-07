import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/theme";
import TextStreamingEffect from "./TextStreamingEffect";

// Custom wrapper for markdown content
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-sm max-w-none">
      {/* Using the same wrapper pattern as in TextStreamingEffect */}
      <div className="markdown-content">
        {content.split('\n').map((line, i) => {
          // Simple handling of markdown-like content
          if (line.startsWith('# ')) {
            return <h1 key={i} className="text-xl font-bold mb-2">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={i} className="text-lg font-bold mb-2">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={i} className="text-md font-bold mb-2">{line.substring(4)}</h3>;
          } else if (line.startsWith('- ')) {
            return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
          } else if (line.trim() === '') {
            return <br key={i} />;
          } else {
            return <p key={i} className="mb-2">{line}</p>;
          }
        })}
      </div>
    </div>
  );
};

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
          <MarkdownContent content={message.content} />
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
