
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface EnhancedChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
  messageId?: string;
}

export const EnhancedChatMessage = ({ 
  message, 
  isUser, 
  timestamp, 
  onFeedback, 
  messageId 
}: EnhancedChatMessageProps) => {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    if (onFeedback && messageId) {
      onFeedback(messageId, type);
      toast({
        title: type === 'like' ? "Thanks for the feedback!" : "Feedback noted",
        description: type === 'like' ? "Glad you found this helpful" : "We'll work on improving our responses",
      });
    }
  };

  return (
    <div className={cn(
      "group flex gap-6 p-6 mb-6 transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 rounded-3xl",
      isUser 
        ? "flex-row-reverse ml-8" 
        : "mr-8"
    )}>
      {/* Avatar */}
      <div className={cn(
        "relative flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl",
        isUser 
          ? "bg-gradient-to-br from-gray-700 to-gray-800 ring-gray-600"
          : "bg-gradient-to-br from-white to-gray-100 ring-gray-200 dark:ring-gray-700"
      )}>
        {isUser ? (
          <div className="w-full h-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        ) : (
          <>
            <img 
              src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
              alt="Omolade AI Assistant" 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        )}
        
        {/* Online indicator for AI */}
        {!isUser && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
        )}
      </div>
      
      {/* Message content */}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "relative p-6 rounded-2xl shadow-lg transition-all duration-300 group-hover:shadow-xl",
          isUser 
            ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white ml-4" 
            : "bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 text-black dark:text-white mr-4 border border-gray-200 dark:border-gray-700"
        )}>
          {/* Message bubble tail */}
          <div className={cn(
            "absolute top-4 w-0 h-0 transition-all duration-300",
            isUser 
              ? "right-[-8px] border-l-[8px] border-l-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
              : "left-[-8px] border-r-[8px] border-r-white dark:border-r-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"
          )}></div>
          
          <div className="prose prose-sm max-w-none">
            {isUser ? (
              <p className="text-white whitespace-pre-wrap break-words m-0 leading-relaxed">
                {message}
              </p>
            ) : (
              <div className="text-black dark:text-white">
                <ReactMarkdown
                  components={{
                    code({ node, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const isInline = !match;
                      
                      return !isInline && match ? (
                        <div className="my-4 rounded-xl overflow-hidden shadow-lg">
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              borderRadius: '0.75rem',
                              margin: 0,
                              fontSize: '0.875rem'
                            }}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-lg text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic my-4 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 py-3 rounded-r-lg">
                        {children}
                      </blockquote>
                    ),
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          {children}
                        </table>
                      </div>
                    ),
                  }}
                >
                  {message}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </div>
        
        {/* Message footer */}
        <div className="flex items-center justify-between mt-3 px-2">
          <span className={cn(
            "text-xs transition-colors duration-200",
            isUser ? "text-gray-500" : "text-gray-500 dark:text-gray-400"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className={cn(
                "h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:scale-110",
                isUser 
                  ? "text-gray-400 hover:text-gray-200 hover:bg-white/10" 
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Copy size={14} />
            </Button>
            
            {!isUser && onFeedback && messageId && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('like')}
                  className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 hover:scale-110"
                >
                  <ThumbsUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('dislike')}
                  className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-110"
                >
                  <ThumbsDown size={14} />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
