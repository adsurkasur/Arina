import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/theme";
import TextStreamingEffect from "./TextStreamingEffect";
import ReactMarkdown from "react-markdown";

// Custom wrapper for markdown content
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
          em: ({ node, ...props }) => <span className="italic" {...props} />,
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return inline ? (
              <code className="bg-gray-100 px-1 rounded" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto my-2">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          ul: ({ ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
          ol: ({ ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
          h1: ({ ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4 first:mt-0" {...props} />,
          h2: ({ ...props }) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
          h3: ({ ...props }) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
          h4: ({ ...props }) => <h4 className="text-base font-bold mt-3 mb-2" {...props} />,
          h5: ({ ...props }) => <h5 className="text-sm font-bold mt-3 mb-2" {...props} />,
          h6: ({ ...props }) => <h6 className="text-xs font-bold mt-3 mb-2" {...props} />,
          p: ({ ...props }) => <p className="my-2 leading-relaxed" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-l-4 border-gray-200 pl-4 italic my-3" {...props} />
          ),
          hr: () => <hr className="my-4 border-t border-gray-200" />,
          a: ({ ...props }) => (
            <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
          table: ({ ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200" {...props} />
            </div>
          ),
          th: ({ ...props }) => <th className="px-3 py-2 bg-gray-50 font-semibold text-left" {...props} />,
          td: ({ ...props }) => <td className="px-3 py-2 border-t" {...props} />,
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
          "p-4 shadow-sm max-w-[80%] whitespace-pre-wrap break-words",
          isUser
            ? "bg-primary text-white ml-3 chat-bubble-user"
            : "bg-white text-gray-800 ml-3 chat-bubble-bot"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words leading-relaxed text-base">{message.content}</p>
        ) : shouldAnimate ? (
          <TextStreamingEffect 
            fullText={message.content} 
            speed={20} 
            onComplete={() => setShowAnimation(false)}
            className="leading-relaxed text-base"
          />
        ) : (
          <div className="whitespace-pre-wrap break-words leading-relaxed prose prose-sm max-w-none prose-p:my-2 prose-pre:my-2">
            <MarkdownContent content={message.content} />
          </div>
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