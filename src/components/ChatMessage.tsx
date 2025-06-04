
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg mb-4 animate-in slide-in-from-bottom-2 duration-300",
      isUser 
        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white ml-12" 
        : "bg-white border border-gray-200 mr-12 shadow-sm"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isUser 
          ? "bg-white/20" 
          : "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
      )}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        <span className={cn(
          "text-xs mt-2 block",
          isUser ? "text-white/70" : "text-gray-500"
        )}>
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};
