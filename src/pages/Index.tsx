import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SettingsModal } from '@/components/SettingsModal';
import { LoadingDots } from '@/components/LoadingDots';
import { useToast } from '@/hooks/use-toast';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:5678/webhook-test/e52793bb-72ab-461f-8f46-404df08e6cc9');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load webhook URL from localStorage on component mount
  useEffect(() => {
    const savedWebhookUrl = localStorage.getItem('n8n-webhook-url');
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    } else {
      // Save the default webhook URL to localStorage
      localStorage.setItem('n8n-webhook-url', 'http://localhost:5678/webhook-test/e52793bb-72ab-461f-8f46-404df08e6cc9');
    }
  }, []);

  // Save webhook URL to localStorage whenever it changes
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('n8n-webhook-url', webhookUrl);
    }
  }, [webhookUrl]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Add welcome message on first load
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        text: "Hello! I'm your private AI assistant. I'm connected to your n8n workflow and ready to help. What would you like to know?",
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, []);

  const sendMessage = async (text: string) => {
    if (!webhookUrl) {
      toast({
        title: "Configuration needed",
        description: "Please configure your n8n webhook URL in settings first.",
        variant: "destructive",
      });
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      console.log('Sending message to n8n webhook:', webhookUrl);
      console.log('Request payload:', {
        message: text,
        timestamp: new Date().toISOString(),
        user_id: 'household_user'
      });
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          timestamp: new Date().toISOString(),
          user_id: 'household_user'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Response from n8n:', result);

      // Check if this is just a workflow start confirmation
      if (result.message === "Workflow was started") {
        console.log('Workflow started, waiting for actual AI response...');
        // Keep loading state active and wait for the actual response
        // The actual AI response should come in the 'response' field
        return;
      }

      // Add AI response - look for 'response' field first, then fallback to 'message'
      const aiResponseText = result.response || result.message || "I received your message but didn't get a response from the AI. Please check your n8n workflow.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Connection failed: ${error.message}. Please check that your n8n workflow is running and the webhook is configured for POST requests.`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection error",
        description: "Failed to connect to your n8n workflow. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      text: "Chat cleared! How can I help you today?",
      isUser: false,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Private AI Assistant</h1>
              <p className="text-sm text-gray-500">Powered by your local AI setup</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={clearChat}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md hover:bg-gray-100"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>

      {/* Settings Button */}
      <SettingsModal 
        webhookUrl={webhookUrl} 
        onWebhookUrlChange={setWebhookUrl} 
      />

      {/* Chat Container */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
          ))}
          
          {isLoading && (
            <div className="bg-white border border-gray-200 mr-12 rounded-lg shadow-sm">
              <LoadingDots />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          onSendMessage={sendMessage}
          isLoading={isLoading}
          disabled={!webhookUrl}
        />
      </div>
    </div>
  );
};

export default Index;
