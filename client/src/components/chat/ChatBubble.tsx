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

// Define proper types for markdown components
interface MarkdownComponentProps {
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}

// Enhanced MarkdownContent component with better styling
const MarkdownContent = ({ content }: { content: string }) => {
  return (
    <div className="markdown-content prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headers with proper spacing and styling
          h1: ({ children, ...props }: MarkdownComponentProps) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-2 border-b border-gray-200" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: MarkdownComponentProps) => (
            <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-5 pb-1 border-b border-gray-100" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: MarkdownComponentProps) => (
            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }: MarkdownComponentProps) => (
            <h4 className="text-base font-semibold text-gray-700 mb-2 mt-3" {...props}>
              {children}
            </h4>
          ),
          
          // Paragraphs with proper spacing
          p: ({ children, ...props }: MarkdownComponentProps) => (
            <p className="mb-3 leading-relaxed text-gray-700" {...props}>
              {children}
            </p>
          ),
          
          // Enhanced lists with better spacing and styling
          ul: ({ children, ...props }: MarkdownComponentProps) => (
            <ul className="mb-4 pl-6 space-y-2 list-disc marker:text-primary" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: MarkdownComponentProps) => (
            <ol className="mb-4 pl-6 space-y-2 list-decimal marker:text-primary marker:font-semibold" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: MarkdownComponentProps) => (
            <li className="text-gray-700 leading-relaxed pl-1" {...props}>
              {children}
            </li>
          ),
          
          // Enhanced blockquotes
          blockquote: ({ children, ...props }: MarkdownComponentProps) => (
            <blockquote className="border-l-4 border-primary/30 bg-gray-50 pl-4 pr-4 py-3 my-4 italic text-gray-700 rounded-r-md" {...props}>
              {children}
            </blockquote>
          ),
          
          // Enhanced code blocks
          code: ({ className, children, ...props }: MarkdownComponentProps) => {
            const match = /language-(\w+)/.exec(className || "");
            return !match ? (
              <code className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono border" {...props}>
                {children}
              </code>
            ) : (
              <div className="my-4">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto border shadow-sm">
                  <code className={className || ""} {...props}>
                    {String(children).trim()}
                  </code>
                </pre>
              </div>
            );
          },
          
          // Enhanced tables with proper styling
          table: ({ children, ...props }: MarkdownComponentProps) => (
            <div className="my-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg shadow-sm" {...props}>
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }: MarkdownComponentProps) => (
            <thead className="bg-gray-50" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }: MarkdownComponentProps) => (
            <tbody className="bg-white divide-y divide-gray-200" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }: MarkdownComponentProps) => (
            <tr className="hover:bg-gray-50 transition-colors" {...props}>
              {children}
            </tr>
          ),
          th: ({ children, ...props }: MarkdownComponentProps) => (
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }: MarkdownComponentProps) => (
            <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100" {...props}>
              {children}
            </td>
          ),
          
          // Enhanced horizontal rules
          hr: ({ ...props }: MarkdownComponentProps) => (
            <hr className="my-6 border-t border-gray-200" {...props} />
          ),
          
          // Strong and emphasis
          strong: ({ children, ...props }: MarkdownComponentProps) => (
            <strong className="font-semibold text-gray-900" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }: MarkdownComponentProps) => (
            <em className="italic text-gray-800" {...props}>
              {children}
            </em>
          ),
          
          // Links
          a: ({ children, href, ...props }: MarkdownComponentProps) => (
            <a 
              href={href} 
              className="text-primary hover:text-primary/80 underline font-medium transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
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
    <div className={cn("flex mb-4 font-sans", isUser && "justify-end")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
          <Sprout className="h-4 w-4" />
        </div>
      )}

      <div
        className={cn(
          "p-4 shadow-sm max-w-[80%] break-words font-sans rounded-lg",
          isUser
            ? "bg-primary text-white ml-3 chat-bubble-user"
            : "bg-white text-gray-800 ml-3 chat-bubble-bot border border-gray-100",
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
          <div className="break-words">
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
