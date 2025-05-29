import React, { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessage } from "@/types";
import ChatBubble from "./ChatBubble";
import ChatInput from "./ChatInput";
import TypingIndicator from "./TypingIndicator";
import ThinkingAnimation from "./ThinkingAnimation";
import { Button } from "../ui/button";
import { MessageSquarePlus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from 'react-i18next';

export default function ChatInterface() {
  const { t } = useTranslation();
  const { messages, isLoading, sendMessage, isSending, activeConversation, createNewChat, deleteConversation, loadChatHistory } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showThinking, setShowThinking] = useState(false);
  const [lastMessageAnimated, setLastMessageAnimated] = useState<string | null>(null);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isSending) {
      setShowThinking(false);
      timer = setTimeout(() => {
        setShowThinking(true);
      }, 2000);
    } else {
      setShowThinking(false);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isSending]);

  useEffect(() => {
    if (messages.length > 0 && messages[messages.length-1].role === 'assistant') {
      const lastMsg = messages[messages.length-1];
      if (lastMsg.content && !lastMessageAnimated) {
        setLastMessageAnimated(lastMsg.content);
      }
    }
  }, [messages, lastMessageAnimated]);

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessage(content);
      setLastMessageAnimated(null);
    }
  };

  const shouldAnimateMessage = (message: ChatMessage, index: number) => {
    return message.role === 'assistant' && 
           index === messages.length - 1 && 
           message.content === lastMessageAnimated;
  };

  const handleDeleteChat = async (id: string) => {
    setChatToDelete(id);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    try {
      await deleteConversation(chatToDelete);
      await loadChatHistory();
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted">
        <h1 className="text-4xl font-bold text-primary mb-4">{t('chat.title')}</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
          {t('chat.welcomeMessage')}
        </p>
        <Button 
          onClick={createNewChat}
          size="lg"
          className="gap-2"
        >
          <MessageSquarePlus className="w-5 h-5" />
          {t('chat.startNewChat')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-muted" id="chatMessages">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center text-gray-500">
              <p>{t('chat.emptyConversation')}</p>
            </div>
          </div>
        ) : (
          <div className="w-full px-4">
            {messages.map((message: ChatMessage, index: number) => (
              <ChatBubble 
                key={message.id || index} 
                message={message} 
                userName={user?.name || "User"}
                userImage={user?.photoURL}
                animate={shouldAnimateMessage(message, index)}
              />
            ))}
            {isSending && (
              showThinking ? <ThinkingAnimation /> : <TypingIndicator />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
      <AlertDialog open={!!chatToDelete} onOpenChange={() => setChatToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('chat.deleteChat')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('chat.deleteChatConfirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('form.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}