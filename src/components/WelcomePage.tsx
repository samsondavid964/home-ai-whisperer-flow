
import React from 'react';
import { Bot, Plus, MessageSquare, Lightbulb, Code, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomePageProps {
  onStartChat: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onStartChat }) => {
  const suggestions = [
    {
      icon: <MessageSquare className="w-4 h-4" />,
      title: "Ask a question",
      description: "Get help with any topic"
    },
    {
      icon: <Code className="w-4 h-4" />,
      title: "Help with code",
      description: "Debug or write code together"
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Brainstorm ideas",
      description: "Generate creative solutions"
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Learn something new",
      description: "Explore topics that interest you"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white dark:bg-black animate-fade-in">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Main heading */}
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full overflow-hidden shadow-lg">
            <img 
              src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
              alt="Omolade AI Assistant" 
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-4xl font-semibold text-black dark:text-white">
            What can I help with?
          </h1>
        </div>

        {/* Suggestion cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={onStartChat}
              className="p-4 text-left border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200 transition-colors">
                  {suggestion.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Start new chat button */}
        <div className="pt-6">
          <Button 
            onClick={onStartChat}
            className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 px-6 py-3 rounded-full transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start new conversation
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
