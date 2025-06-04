
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
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setIsTyping(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  return (
    <div className={cn(
      "p-6 bg-gradient-to-t from-white via-gray-50/50 to-white dark:from-black dark:via-gray-900/50 dark:to-black border-t border-gray-300 dark:border-gray-700 transition-all duration-300",
      isFocused && "bg-gradient-to-t from-gray-50 via-gray-100/30 to-gray-50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900"
    )}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className={cn(
          "relative bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 shadow-lg hover:shadow-xl",
          isFocused 
            ? "border-gray-400 dark:border-gray-500 shadow-2xl ring-4 ring-gray-200/50 dark:ring-gray-600/50" 
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        )}>
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Ask your AI assistant anything..."
            className={cn(
              "min-h-[60px] max-h-[200px] resize-none border-0 bg-transparent pr-32 pl-6 py-4 text-base leading-relaxed transition-all duration-200",
              "placeholder:text-gray-500 dark:placeholder:text-gray-400 text-black dark:text-white",
              "focus:ring-0 focus:outline-none focus-visible:ring-0"
            )}
            disabled={disabled || isLoading}
            rows={1}
          />
          
          {/* Action buttons */}
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <div className="flex gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 rounded-xl"
                disabled={disabled || isLoading}
              >
                <Paperclip className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 rounded-xl"
                disabled={disabled || isLoading}
              >
                <Mic className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
              </Button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            
            <Button 
              type="submit" 
              disabled={!message.trim() || isLoading || disabled}
              className={cn(
                "h-10 w-10 p-0 rounded-xl transition-all duration-300 overflow-hidden relative group",
                message.trim() && !isLoading && !disabled
                  ? "bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black hover:from-black hover:to-gray-800 dark:hover:from-gray-100 dark:hover:to-white shadow-lg hover:shadow-xl hover:scale-110 hover:rotate-3" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              {/* Shine effect */}
              {message.trim() && !isLoading && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 group-hover:animate-pulse"></div>
              )}
              
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  message.trim() ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : ""
                )} />
              )}
            </Button>
          </div>
          
          {/* Typing indicator */}
          {isTyping && !isLoading && (
            <div className="absolute -top-8 left-4 text-xs text-gray-500 dark:text-gray-400 animate-in fade-in duration-200">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="ml-1">Typing...</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
