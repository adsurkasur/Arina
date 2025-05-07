import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask Arina about your agricultural business..."
            className="w-full border border-gray-300 rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary hover:bg-gray-100 p-2 rounded-full"
            disabled={!message.trim() || disabled}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="flex justify-center mt-2 text-xs text-gray-500">
          <span>Arina is an AI assistant that can browse the web and integrate with your business tools.</span>
        </div>
      </div>
    </div>
  );
}
