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
      <ReactMarkdown
        components={{
          strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
          em: ({ node, ...props }) => <span className="italic" {...props} />,
          code: ({ node, inline, ...props }) => 
            inline ? (
              <code className="bg-gray-100 px-1 rounded" {...props} />
            ) : (
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">
                <code {...props} />
              </pre>
            ),
          ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1" {...props} />,
          h1: ({ ...props }) => <h1 className="text-xl font-bold my-2" {...props} />,
          h2: ({ ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
          h3: ({ ...props }) => <h3 className="text-base font-bold my-2" {...props} />,
          p: ({ ...props }) => <p className="my-2" {...props} />,
          blockquote: ({ ...props }) => <blockquote className="border-l-4 border-gray-200 pl-4 italic" {...props} />,
        }}
      >
        {content || ""}
      </ReactMarkdown>
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
