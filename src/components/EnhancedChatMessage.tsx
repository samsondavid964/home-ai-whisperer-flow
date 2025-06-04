
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
      "group flex gap-4 p-6 rounded-2xl mb-4 transition-all duration-500 ease-out animate-in slide-in-from-bottom-4",
      isUser 
        ? "bg-gray-700 text-white ml-8 shadow-lg"
        : "bg-gray-200 dark:bg-gray-300 mr-8 shadow-lg text-black"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden",
        isUser 
          ? "bg-gray-600"
          : "bg-gray-100"
      )}>
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <img 
            src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
            alt="Omolade AI Assistant" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none">
          {isUser ? (
            <p className="text-white whitespace-pre-wrap break-words m-0 leading-relaxed">
              {message}
            </p>
          ) : (
            <div className="text-black">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    
                    return !isInline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          borderRadius: '0.5rem',
                          marginTop: '1rem',
                          marginBottom: '1rem'
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-gray-300 px-1.5 py-0.5 rounded text-sm text-black" {...props}>
                        {children}
                      </code>
                    );
                  },
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-700">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-gray-400">
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
        
        <div className="flex items-center justify-between mt-4">
          <span className={cn(
            "text-xs",
            isUser ? "text-white/70" : "text-gray-600"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className={cn(
                "h-8 w-8 p-0",
                isUser 
                  ? "text-white/70 hover:text-white hover:bg-white/10" 
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-300"
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
                  className="h-8 w-8 p-0 text-gray-500 hover:text-green-600"
                >
                  <ThumbsUp size={14} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeedback('dislike')}
                  className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
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
