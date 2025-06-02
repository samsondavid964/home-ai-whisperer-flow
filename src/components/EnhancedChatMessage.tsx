
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    <div 
      className={cn(
        "group flex gap-4 p-6 rounded-2xl mb-4 transition-all duration-500 ease-out animate-in slide-in-from-bottom-4",
        isUser 
          ? "bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 text-white ml-8 shadow-lg shadow-blue-500/25" 
          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-8 shadow-lg shadow-gray-500/10 dark:shadow-gray-900/20"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg",
        isUser 
          ? "bg-white/20 backdrop-blur-sm" 
          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
      )}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="text-white whitespace-pre-wrap break-words m-0 leading-relaxed">
              {message}
            </p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="text-gray-900 dark:text-gray-100"
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg !mt-4 !mb-4"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm" {...props}>
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
                    {children}
                  </blockquote>
                ),
                table: ({ children }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      {children}
                    </table>
                  </div>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <span className={cn(
            "text-xs",
            isUser ? "text-white/70" : "text-gray-500 dark:text-gray-400"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className={cn(
                "h-7 w-7 p-0",
                isUser 
                  ? "hover:bg-white/20 text-white/70 hover:text-white" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              )}
            >
              <Copy className="w-3 h-3" />
            </Button>
            
            {!isUser && onFeedback && messageId && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('like')}
                  className="h-7 w-7 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 hover:text-green-600"
                >
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('dislike')}
                  className="h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                >
                  <ThumbsDown className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
