
import { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface TextStreamingEffectProps {
  fullText: string;
  onComplete?: () => void;
}

const MarkdownRenderer = ({ children }: { children: string }) => {
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          a: ({ ...props }) => (
            <a {...props} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" />
          ),
          ul: ({ ...props }) => (
            <ul {...props} className="list-disc pl-5 my-2" />
          ),
          ol: ({ ...props }) => (
            <ol {...props} className="list-decimal pl-5 my-2" />
          ),
          li: ({ ...props }) => (
            <li {...props} className="my-1" />
          ),
          p: ({ ...props }) => (
            <p {...props} className="mb-2" />
          ),
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return !match ? (
              <code {...props} className="bg-gray-100 p-0.5 rounded">{children}</code>
            ) : (
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ ...props }) => (
            <div className="overflow-x-auto">
              <table {...props} className="border-collapse border border-gray-300 my-2" />
            </div>
          ),
          th: ({ ...props }) => (
            <th {...props} className="border border-gray-300 p-2 bg-gray-100" />
          ),
          td: ({ ...props }) => (
            <td {...props} className="border border-gray-300 p-2" />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
};

export default function TextStreamingEffect({ 
  fullText, 
  onComplete 
}: TextStreamingEffectProps) {
  useEffect(() => {
    if (onComplete) {
      onComplete();
    }
  }, [fullText, onComplete]);

  return (
    <div className="relative inline-block w-full">
      <MarkdownRenderer>{fullText}</MarkdownRenderer>
    </div>
  );
}
