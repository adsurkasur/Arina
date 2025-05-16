import React from "react"; // Ensure React is in scope for JSX
import { useState, useEffect } from "react";
import { ChatMessage } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sprout } from "lucide-react";
import { cn } from "@/lib/theme";
import TextStreamingEffect from "./TextStreamingEffect";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"; // For GitHub-flavored markdown
import rehypeRaw from "rehype-raw"; // To handle raw HTML safely
import { ReactNode } from "react";

// Adjusting the rendering of markdown content to ensure multi-line support
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <div className="markdown-content prose prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]} // Enable GitHub-flavored markdown
        rehypePlugins={[rehypeRaw]} // Handle raw HTML safely
        components={{
          p: ({ ...props }: { children?: ReactNode }) => (
            <p className="my-2 leading-relaxed" {...props} />
          ), // Ensure proper spacing for paragraphs
          code: ({
            className,
            children,
            ...props
          }: {
            className?: string;
            children?: ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !match ? (
              <code className="bg-gray-100 px-1 rounded text-black" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto my-2">
                <code className={className || ""} {...props}>
                  {String(children).trim()}
                </code>
              </pre>
            );
          },
          blockquote: ({ ...props }: { children?: ReactNode }) => (
            <blockquote
              className="border-l-4 border-gray-200 pl-4 italic my-3"
              {...props}
            />
          ),
          ul: ({ ...props }: { children?: ReactNode }) => (
            <ul className="list-disc pl-4 space-y-1 my-2" {...props} />
          ),
          ol: ({ ...props }: { children?: ReactNode }) => (
            <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />
          ),
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

export default function ChatBubble({
  message,
  userName,
  userImage,
  animate = false,
}: ChatBubbleProps) {
  const isUser = message.role === "user";
  const [isStreaming, setIsStreaming] = useState(animate && !isUser);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Only stream assistant messages that don't have an ID yet (new messages)
  const shouldStream = !isUser && animate && !message.id && !hasCompleted;

  // Handle completion of streaming
  const handleStreamComplete = () => {
    setIsStreaming(false);
    setHasCompleted(true);
  };

  // Reset streaming state when message changes
  useEffect(() => {
    if (message.id) {
      setIsStreaming(false);
      setHasCompleted(true);
    } else if (!isUser && animate) {
      setIsStreaming(true);
      setHasCompleted(false);
    }
  }, [message.id, isUser, animate]);

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
            : "bg-white text-gray-800 ml-3 chat-bubble-bot",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words leading-relaxed text-base">
            {message.content}
          </p>
        ) : shouldStream ? (
          <TextStreamingEffect
            fullText={message.content}
            onComplete={handleStreamComplete}
            className="leading-relaxed text-base"
          />
        ) : (
          <div className="markdown-content whitespace-pre-wrap break-words leading-relaxed">
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
