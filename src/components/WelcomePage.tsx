import React from 'react';
import { Bot, Plus, MessageSquare, Lightbulb, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomePageProps {
  onStartChat: () => void;
  onStartChatWithPrompt: (promptText: string) => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStartChat, onStartChatWithPrompt }) => {
  const suggestions = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      title: "Ask a question",
      description: "Get help with any topic",
      prompt: "What can you help me with today? I'm looking to learn something new."
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: "Help with code",
      description: "Debug or write code together",
      prompt: "I need help with my code. Could you review this and suggest improvements?"
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Brainstorm ideas",
      description: "Generate creative solutions",
      prompt: "I'm looking for creative ideas. Can you help me brainstorm some innovative solutions?"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Learn something new",
      description: "Explore topics that interest you",
      prompt: "I'd like to learn something new today. What interesting topics can you teach me about?"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-black dark:to-gray-800 animate-fade-in">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Main heading with floating animation */}
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          <div className="relative">
            <div className="w-20 h-20 mx-auto rounded-full overflow-hidden shadow-2xl ring-4 ring-white/20 hover:ring-white/40 transition-all duration-300 hover:scale-105 group animate-float">
              <img 
                src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
                alt="Omolade AI Assistant" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            {/* Floating particles effect */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-purple-500 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-700 dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
            What can I help with?
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
            I'm Omolade, your personal AI assistant. Let's start a conversation and explore what we can accomplish together.
          </p>
        </div>

        {/* Suggestion cards with staggered animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="animate-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button
                onClick={() => onStartChatWithPrompt(suggestion.prompt)}
                className="w-full p-6 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 group hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 hover:-translate-y-1 hover:border-gray-300 dark:hover:border-gray-600 hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-gradient-to-br group-hover:from-blue-100 group-hover:to-purple-100 dark:group-hover:from-blue-900 dark:group-hover:to-purple-900">
                    {suggestion.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {suggestion.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {suggestion.description}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>

        {/* Start new chat button with enhanced styling */}
        <div className="pt-8 animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '600ms' }}>
          <Button 
            onClick={onStartChat}
            className="relative bg-gradient-to-r from-gray-900 to-black dark:from-white dark:to-gray-200 text-white dark:text-black hover:from-black hover:to-gray-800 dark:hover:from-gray-100 dark:hover:to-white px-8 py-4 rounded-full transition-all duration-300 hover:shadow-2xl hover:shadow-gray-900/25 dark:hover:shadow-white/25 hover:scale-105 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 group-hover:animate-pulse"></div>
            <Plus className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-medium">Start new conversation</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
