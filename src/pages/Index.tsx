import { useState, useEffect, useRef } from 'react';
import { EnhancedChatMessage } from '@/components/EnhancedChatMessage';
import { EnhancedChatInput } from '@/components/EnhancedChatInput';
import { TypingIndicator } from '@/components/TypingIndicator';
import AppSidebar from '@/components/AppSidebar';
import WelcomePage from '@/components/WelcomePage';
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
  const [showWelcome, setShowWelcome] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('http://192.168.101.3:5678/webhook/e52793bb-72ab-461f-8f46-404df08e6cc9');
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
        setShowWelcome(false);
      } else if (parsedSessions.length > 0) {
        // Don't auto-select a session, stay on welcome page
        setShowWelcome(true);
      }
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

  const createNewSession = (startWithMessage?: string) => {
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
    setShowWelcome(false);

    // If starting with a message, send it immediately
    if (startWithMessage) {
      setTimeout(() => {
        sendMessage(startWithMessage);
      }, 500);
    }

    return newSession.id;
  };

  const handleStartChat = () => {
    createNewSession();
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

    // If we're on welcome page, create a new session first
    if (showWelcome || !currentSessionId) {
      const newSessionId = createNewSession();
      setCurrentSessionId(newSessionId);
      setShowWelcome(false);
      
      // Wait for state to update before sending message
      setTimeout(() => {
        sendMessage(text);
      }, 100);
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
      
      const params = new URLSearchParams({
        message: text,
        timestamp: new Date().toISOString(),
        user_id: 'household_user'
      });
      
      const response = await fetch(`${webhookUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
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
        text: `Connection failed: ${error.message}. Please check that your n8n workflow is running and the webhook is configured for GET requests.`,
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
          // Don't auto-select another session, go to welcome page
          setCurrentSessionId('');
          setShowWelcome(true);
        } else {
          setCurrentSessionId('');
          setShowWelcome(true);
        }
      }
      return filtered;
    });
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setShowWelcome(false);
  };

  const currentSession = getCurrentSession();
  const currentMessages = currentSession?.messages || [];

  return (
    <ThemeProvider defaultTheme="system" storageKey="ai-chat-theme">
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-gray-900 dark:via-black dark:to-gray-800">
          <AppSidebar
            currentSessionId={currentSessionId}
            onNewChat={handleStartChat}
            onSelectSession={handleSelectSession}
            onDeleteSession={handleDeleteSession}
            sessions={sessions}
          />
          
          <SidebarInset className="flex flex-col">
            {showWelcome ? (
              <>
                {/* Welcome Header */}
                <header className="bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-gray-300/50 dark:border-gray-700/50 p-4 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SidebarTrigger className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200" />
                      <h1 className="text-xl font-semibold text-black dark:text-white">
                        AI Assistant
                      </h1>
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

                {/* Welcome Page */}
                <WelcomePage onStartChat={handleStartChat} />
              </>
            ) : (
              <>
                {/* Chat Header */}
                <header className="bg-white/90 dark:bg-black/90 backdrop-blur-xl border-b border-gray-300/50 dark:border-gray-700/50 p-4 animate-fade-in transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SidebarTrigger className="h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200" />
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-2 ring-gray-200 dark:ring-gray-700 hover:scale-105 transition-transform duration-200">
                          <img 
                            src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
                            alt="Omolade AI Assistant" 
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-black animate-pulse"></div>
                        </div>
                        <div>
                          <h1 className="text-xl font-semibold text-black dark:text-white">
                            {currentSession?.title || 'AI Assistant'}
                          </h1>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Omolade, the Winterfell household Personal Assistant
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
                <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-gradient-to-b from-transparent via-gray-50/30 to-transparent dark:via-gray-900/30 animate-fade-in">
                  {currentMessages.map((message, index) => (
                    <div
                      key={message.id}
                      className="animate-in slide-in-from-bottom-4 duration-500"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <EnhancedChatMessage
                        message={message.text}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                        messageId={message.id}
                        onFeedback={handleFeedback}
                      />
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="animate-in fade-in duration-300">
                      <TypingIndicator />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <EnhancedChatInput
                  onSendMessage={sendMessage}
                  isLoading={isLoading}
                  disabled={!webhookUrl}
                />
              </>
            )}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default Index;
