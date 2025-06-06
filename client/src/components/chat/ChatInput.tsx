import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
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
    <div className="border-t border-gray-200 bg-white p-2 font-sans">
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            placeholder={t('chat.inputPlaceholder')}
            className="w-full border border-gray-300 rounded-lg pl-3 pr-10 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none font-sans"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:bg-gray-100 p-2 rounded-full"
            disabled={!message.trim() || disabled}
            aria-label={t('form.submit')}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
        <div className="flex justify-center mt-1 text-xs text-gray-500 font-sans">
          <span className="text-center">{t('chat.assistantDescription')}</span>
        </div>
      </div>
    </div>
  );
}
