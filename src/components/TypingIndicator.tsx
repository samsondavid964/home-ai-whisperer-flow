
export const TypingIndicator = () => {
  return (
    <div className="group flex gap-6 p-6 mb-6 mr-8 animate-in slide-in-from-bottom-4 duration-500">
      {/* Avatar */}
      <div className="relative flex-shrink-0 w-12 h-12 rounded-2xl overflow-hidden shadow-lg ring-2 ring-gray-200 dark:ring-gray-700 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-750">
        <img 
          src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
          alt="Omolade AI Assistant" 
          className="w-full h-full object-cover"
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
      </div>
      
      {/* Typing bubble */}
      <div className="flex-1">
        <div className="relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-750 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mr-4 max-w-xs">
          {/* Message bubble tail */}
          <div className="absolute left-[-8px] top-4 w-0 h-0 border-r-[8px] border-r-white dark:border-r-gray-800 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
          
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 animate-pulse">Omolade is thinking...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
