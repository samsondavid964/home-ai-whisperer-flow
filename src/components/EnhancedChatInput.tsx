import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, Mic, MicOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// File validation constants
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'text/markdown'
] as const;

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

interface EnhancedChatInputProps {
  onSendMessage: (message: string, file?: File) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const EnhancedChatInput = ({ onSendMessage, isLoading, disabled }: EnhancedChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechApiAvailable, setIsSpeechApiAvailable] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { toast } = useToast();

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSpeechApiAvailable(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'en-US';

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update message with both final and interim results
      setMessage(prev => {
        // Remove any previous interim results
        const baseMessage = prev.replace(/\[interim\].*$/, '');
        return baseMessage + finalTranscript + (interimTranscript ? ` [interim]${interimTranscript}` : '');
      });
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
      // Clean up any interim results
      setMessage(prev => prev.replace(/\[interim\].*$/, ''));
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: "Voice input error",
        description: `Error: ${event.error}`,
        variant: "destructive",
      });
      setIsRecording(false);
    };

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [toast]);

  // Cleanup image preview URL when component unmounts or when imagePreviewUrl changes
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || selectedFile) && !isLoading && !disabled) {
      onSendMessage(message.trim(), selectedFile || undefined);
      setMessage('');
      setSelectedFile(null);
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
      toast({
        title: "Invalid file type",
        description: `Allowed types: ${ALLOWED_FILE_TYPES.map(type => type.split('/')[1]).join(', ')}`,
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${formatFileSize(MAX_FILE_SIZE_BYTES)}`,
        variant: "destructive",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Clean up previous image preview if it exists
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }

    // Generate new image preview if file is an image
    if (file.type.startsWith('image/')) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreviewUrl(previewUrl);
    }

    setSelectedFile(file);
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl(null);
    }
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMicClick = () => {
    if (!isSpeechApiAvailable) {
      toast({
        title: "Voice input not available",
        description: "Your browser doesn't support voice input.",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      setMessage(''); // Clear existing message when starting new recording
      recognitionRef.current?.start();
      setIsRecording(true);
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
    <div className={cn(
      "p-6 bg-gradient-to-t from-white via-gray-50/50 to-white dark:from-black dark:via-gray-900/50 dark:to-black border-t border-gray-300 dark:border-gray-700 transition-all duration-300",
      isFocused && "bg-gradient-to-t from-gray-50 via-gray-100/30 to-gray-50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900"
    )}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* File input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={ALLOWED_FILE_TYPES.join(',')}
          className="hidden"
          disabled={disabled || isLoading}
        />

        {/* Selected file display */}
        {selectedFile && (
          <div className="mb-2 flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 animate-in slide-in-from-bottom-2">
            {imagePreviewUrl && (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img
                  src={imagePreviewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              onClick={handleRemoveFile}
              disabled={disabled || isLoading}
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </Button>
          </div>
        )}

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
                className={cn(
                  "h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 rounded-xl",
                  selectedFile && "text-blue-500 dark:text-blue-400"
                )}
                onClick={handleFileButtonClick}
                disabled={disabled || isLoading}
              >
                <Paperclip className="w-4 h-4 transition-colors" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-9 w-9 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 rounded-xl",
                  !isSpeechApiAvailable && "opacity-50 cursor-not-allowed",
                  isRecording && "text-red-500 dark:text-red-400 animate-pulse"
                )}
                onClick={handleMicClick}
                disabled={disabled || isLoading || !isSpeechApiAvailable}
              >
                {isRecording ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <MicOff className="w-4 h-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" />
                )}
              </Button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            
            <Button 
              type="submit" 
              disabled={(!message.trim() && !selectedFile) || isLoading || disabled}
              className={cn(
                "h-10 w-10 p-0 rounded-xl transition-all duration-300 overflow-hidden relative group",
                (message.trim() || selectedFile) && !isLoading && !disabled
                  ? "bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black hover:from-black hover:to-gray-800 dark:hover:from-gray-100 dark:hover:to-white shadow-lg hover:shadow-xl hover:scale-110 hover:rotate-3" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              {/* Shine effect */}
              {(message.trim() || selectedFile) && !isLoading && !disabled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 group-hover:animate-pulse"></div>
              )}
              
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  (message.trim() || selectedFile) ? "group-hover:translate-x-0.5 group-hover:-translate-y-0.5" : ""
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
