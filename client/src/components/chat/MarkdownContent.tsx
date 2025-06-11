import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"; // Changed to lighter theme
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReactNode } from "react";

// Define proper types for markdown components
interface MarkdownComponentProps {
  children?: ReactNode;
  className?: string;
  [key: string]: any;
}

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  return (
    <div className="prose prose-sm max-w-none text-gray-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headers dengan tema hijau yang subtle
          h1: ({ children, ...props }: MarkdownComponentProps) => (
            <h1 className="text-2xl font-bold text-gray-900 mb-4 mt-6 pb-2 border-b-2 border-green-500" {...props}>
              {children}
            </h1>
          ),
          h2: ({ children, ...props }: MarkdownComponentProps) => (
            <h2 className="text-xl font-semibold text-white mb-3 mt-5 bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 rounded-lg shadow-sm" {...props}>
              {children}
            </h2>
          ),
          h3: ({ children, ...props }: MarkdownComponentProps) => (
            <h3 className="text-lg font-semibold text-green-800 mb-2 mt-4 bg-green-50 px-3 py-2 rounded border-l-4 border-green-500" {...props}>
              {children}
            </h3>
          ),
          h4: ({ children, ...props }: MarkdownComponentProps) => (
            <h4 className="text-base font-semibold text-green-700 mb-2 mt-3" {...props}>
              {children}
            </h4>
          ),

          // Table components dengan tema hijau yang subtle
          table: ({ children, ...props }: MarkdownComponentProps) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-green-200 shadow-sm">
              <Table className="w-full" {...props}>
                {children}
              </Table>
            </div>
          ),
          thead: ({ children, ...props }: MarkdownComponentProps) => (
            <TableHeader className="bg-gradient-to-r from-green-500 to-green-600" {...props}>
              {children}
            </TableHeader>
          ),
          tbody: ({ children, ...props }: MarkdownComponentProps) => (
            <TableBody {...props}>
              {children}
            </TableBody>
          ),
          tr: ({ children, ...props }: MarkdownComponentProps) => (
            <TableRow className="hover:bg-green-50 transition-colors duration-200" {...props}>
              {children}
            </TableRow>
          ),
          th: ({ children, ...props }: MarkdownComponentProps) => (
            <TableHead className="text-white font-semibold py-3 px-4 text-left" {...props}>
              {children}
            </TableHead>
          ),
          td: ({ children, ...props }: MarkdownComponentProps) => (
            <TableCell className="py-3 px-4 border-b border-green-100" {...props}>
              {children}
            </TableCell>
          ),

          // Lists dengan styling yang simple
          ul: ({ children, ...props }: MarkdownComponentProps) => (
            <ul className="mb-4 pl-6 space-y-1 list-disc marker:text-green-600" {...props}>
              {children}
            </ul>
          ),
          ol: ({ children, ...props }: MarkdownComponentProps) => (
            <ol className="mb-4 pl-6 space-y-1 list-decimal marker:text-green-600 marker:font-semibold" {...props}>
              {children}
            </ol>
          ),
          li: ({ children, ...props }: MarkdownComponentProps) => (
            <li className="text-gray-700 leading-relaxed" {...props}>
              {children}
            </li>
          ),

          // Blockquotes dengan tema hijau yang subtle
          blockquote: ({ children, ...props }: MarkdownComponentProps) => (
            <blockquote className="border-l-4 border-green-500 bg-green-50 pl-4 pr-4 py-3 my-4 italic text-green-800 rounded-r-md" {...props}>
              {children}
            </blockquote>
          ),

          // Code blocks dengan styling yang lebih clean
          code: ({ className, children, ...props }: MarkdownComponentProps) => {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : undefined;

            // For inline code
            if (!match) {
              return (
                <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-mono border border-green-200" {...props}>
                  {children}
                </code>
              );
            }

            // For code blocks with language specification
            return (
              <div className="my-4">
                <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm font-semibold rounded-t-lg">
                  {language?.toUpperCase() || 'CODE'}
                </div>
                <SyntaxHighlighter
                  style={oneLight} // Changed to lighter theme
                  language={language}
                  PreTag="div"
                  className="!mt-0 !rounded-t-none rounded-b-lg shadow-sm border border-gray-200"
                  customStyle={{
                    margin: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundColor: '#fafafa',
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            );
          },

          // Paragraphs dengan spacing yang baik
          p: ({ children, ...props }: MarkdownComponentProps) => (
            <p className="mb-3 leading-relaxed text-gray-700" {...props}>
              {children}
            </p>
          ),

          // Horizontal rules
          hr: ({ ...props }: MarkdownComponentProps) => (
            <hr className="my-6 border-t border-green-200" {...props} />
          ),

          // Strong and emphasis dengan styling yang subtle
          strong: ({ children, ...props }: MarkdownComponentProps) => (
            <strong className="font-semibold text-green-800" {...props}>
              {children}
            </strong>
          ),
          em: ({ children, ...props }: MarkdownComponentProps) => (
            <em className="italic text-green-700" {...props}>
              {children}
            </em>
          ),

          // Links dengan tema hijau
          a: ({ children, href, ...props }: MarkdownComponentProps) => (
            <a
              href={href}
              className="text-green-600 hover:text-green-800 underline font-medium transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          // Custom styling untuk pre tag
          pre: ({ children, ...props }: MarkdownComponentProps) => (
            <pre className="bg-gray-50 text-gray-800 p-4 rounded-lg overflow-x-auto my-4 border border-gray-200" {...props}>
              {children}
            </pre>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;