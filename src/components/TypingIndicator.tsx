
export const TypingIndicator = () => {
  return (
    <div className="group flex gap-4 p-6 rounded-2xl mb-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-8 shadow-lg animate-in slide-in-from-bottom-4">
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg">
        <div className="w-5 h-5 rounded-full bg-white/20 animate-pulse" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-1 py-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};
