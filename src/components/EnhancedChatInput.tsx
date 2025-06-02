
import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface EnhancedChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const EnhancedChatInput = ({ onSendMessage, isLoading, disabled }: EnhancedChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <form 
      onSubmit={handleSubmit} 
      className={cn(
        "flex gap-3 p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 transition-all duration-200",
        isFocused && "bg-gray-50 dark:bg-gray-800"
      )}
    >
      <div className="flex-1 relative">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask your AI assistant anything..."
          className={cn(
            "min-h-[50px] max-h-[200px] resize-none pr-24 border-2 transition-all duration-200 bg-white dark:bg-gray-800",
            isFocused && "border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20",
            "placeholder:text-gray-400 dark:placeholder:text-gray-500"
          )}
          disabled={disabled || isLoading}
          rows={1}
        />
        
        <div className="absolute right-2 bottom-2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={disabled || isLoading}
          >
            <Paperclip className="w-4 h-4 text-gray-400" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            disabled={disabled || isLoading}
          >
            <Mic className="w-4 h-4 text-gray-400" />
          </Button>
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={!message.trim() || isLoading || disabled}
        className={cn(
          "self-end h-12 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg",
          !message.trim() || isLoading || disabled 
            ? "opacity-50 cursor-not-allowed" 
            : "hover:shadow-xl hover:scale-105"
        )}
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </Button>
    </form>
  );
};
