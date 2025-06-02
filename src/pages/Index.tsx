
import { useState, useEffect, useRef } from 'react';
import { EnhancedChatMessage } from '@/components/EnhancedChatMessage';
import { EnhancedChatInput } from '@/components/EnhancedChatInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import { AppSidebar } from '@/components/AppSidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SettingsModal } from '@/components/SettingsModal';
import { useToast } from '@/hooks/use-toast';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Bot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: Message[];
}

const Index = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('http://localhost:5678/webhook-test/e52793bb-72ab-461f-8f46-404df08e6cc9');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chat-sessions');
    const savedCurrentSession = localStorage.getItem('current-session-id');
    const savedWebhookUrl = localStorage.getItem('n8n-webhook-url');
    
    if (savedWebhookUrl) {
      setWebhookUrl(savedWebhookUrl);
    } else {
      localStorage.setItem('n8n-webhook-url', webhookUrl);
    }

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        timestamp: new Date(session.timestamp),
        messages: session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
      setSessions(parsedSessions);
      
      if (savedCurrentSession && parsedSessions.find((s: ChatSession) => s.id === savedCurrentSession)) {
        setCurrentSessionId(savedCurrentSession);
      } else if (parsedSessions.length > 0) {
        setCurrentSessionId(parsedSessions[0].id);
      } else {
        createNewSession();
      }
    } else {
      createNewSession();
    }
  }, []);

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chat-sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (currentSessionId) {
      localStorage.setItem('current-session-id', currentSessionId);
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem('n8n-webhook-url', webhookUrl);
    }
  }, [webhookUrl]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, currentSessionId, isLoading]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Conversation',
      lastMessage: '',
      timestamp: new Date(),
      messageCount: 1,
      messages: [{
        id: '1',
        text: "Hey! Omolade here. Send me a message and let's get started.",
        isUser: false,
        timestamp: new Date()
      }]
    };
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const getCurrentSession = () => {
    return sessions.find(session => session.id === currentSessionId);
  };

  const updateCurrentSession = (updater: (session: ChatSession) => ChatSession) => {
    setSessions(prev => prev.map(session => 
      session.id === currentSessionId ? updater(session) : session
    ));
  };

  const generateSessionTitle = (firstMessage: string) => {
    const words = firstMessage.split(' ').slice(0, 6);
    return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
  };

  const sendMessage = async (text: string) => {
    if (!webhookUrl) {
      toast({
        title: "Configuration needed",
        description: "Please configure your n8n webhook URL in settings first.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date()
    };

    updateCurrentSession(session => {
      const isFirstUserMessage = session.messages.filter(m => m.isUser).length === 0;
      return {
        ...session,
        title: isFirstUserMessage ? generateSessionTitle(text) : session.title,
        lastMessage: text,
        timestamp: new Date(),
        messageCount: session.messageCount + 1,
        messages: [...session.messages, userMessage]
      };
    });

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

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response body:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Full response from n8n:', result);

      if (result.message === "Workflow was started") {
        console.log('Workflow started, waiting for actual AI response...');
        return;
      }

      let aiResponseText = '';
      
      if (result.RESPONSE) {
        aiResponseText = result.RESPONSE;
        console.log('Found AI response in RESPONSE field:', aiResponseText);
      } else if (result.response) {
        aiResponseText = result.response;
        console.log('Found AI response in response field:', aiResponseText);
      } else if (result.message && result.message !== "Workflow was started") {
        aiResponseText = result.message;
        console.log('Found AI response in message field:', aiResponseText);
      } else {
        aiResponseText = "I received your message but didn't get a response from the AI. Please check your n8n workflow configuration.";
        console.log('No AI response found in any expected field. Full result:', result);
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponseText,
        isUser: false,
        timestamp: new Date()
      };

      updateCurrentSession(session => ({
        ...session,
        lastMessage: aiResponseText.slice(0, 100),
        timestamp: new Date(),
        messageCount: session.messageCount + 1,
        messages: [...session.messages, aiMessage]
      }));
      
    } catch (error) {
      console.error('Error sending message to n8n:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Connection failed: ${error.message}. Please check that your n8n workflow is running and the webhook is configured for POST requests.`,
        isUser: false,
        timestamp: new Date()
      };

      updateCurrentSession(session => ({
        ...session,
        lastMessage: "Connection failed",
        timestamp: new Date(),
        messageCount: session.messageCount + 1,
        messages: [...session.messages, errorMessage]
      }));
      
      toast({
        title: "Connection error",
        description: "Failed to connect to your n8n workflow. Check the console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
    console.log(`Feedback for message ${messageId}: ${type}`);
  };

  const handleDeleteSession = (sessionId: string) => {
    setSessions(prev => {
      const filtered = prev.filter(session => session.id !== sessionId);
      if (sessionId === currentSessionId) {
        if (filtered.length > 0) {
          setCurrentSessionId(filtered[0].id);
        } else {
          createNewSession();
        }
      }
      return filtered;
    });
  };

  const currentSession = getCurrentSession();
  const currentMessages = currentSession?.messages || [];

  return (
    <ThemeProvider defaultTheme="system" storageKey="ai-chat-theme">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
          <AppSidebar
            currentSessionId={currentSessionId}
            onNewChat={createNewSession}
            onSelectSession={setCurrentSessionId}
            onDeleteSession={handleDeleteSession}
            sessions={sessions}
          />
          
          <SidebarInset className="flex flex-col">
            {/* Header */}
            <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SidebarTrigger className="h-8 w-8" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {currentSession?.title || 'AI Assistant'}
                      </h1>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Powered by your n8n workflow
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <SettingsModal 
                    webhookUrl={webhookUrl} 
                    onWebhookUrlChange={setWebhookUrl} 
                  />
                </div>
              </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentMessages.map((message) => (
                <EnhancedChatMessage
                  key={message.id}
                  message={message.text}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                  messageId={message.id}
                  onFeedback={handleFeedback}
                />
              ))}
              
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <EnhancedChatInput
              onSendMessage={sendMessage}
              isLoading={isLoading}
              disabled={!webhookUrl}
            />
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
