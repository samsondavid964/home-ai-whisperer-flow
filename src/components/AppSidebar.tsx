
import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Search, Settings, Trash2, Clock } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
}

interface AppSidebarProps {
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  sessions: ChatSession[];
}

export function AppSidebar({
  currentSessionId,
  onNewChat,
  onSelectSession,
  onDeleteSession,
  sessions,
}: AppSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelativeTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Sidebar className="border-r border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <SidebarHeader className="border-b border-gray-300 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/752720fc-be8e-4106-95e8-b67a4b02a185.png" 
              alt="AI Assistant" 
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-semibold text-black dark:text-white">AI Assistant</span>
        </div>
        <Button 
          onClick={onNewChat}
          className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 dark:text-gray-300">Search Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-700 dark:text-gray-300">Recent Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <div className={cn(
                    "w-full p-3 rounded-lg group relative hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer",
                    currentSessionId === session.id && "bg-gray-200 dark:bg-gray-700"
                  )}
                  onClick={() => onSelectSession(session.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-sm truncate text-black dark:text-white">
                            {session.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {getRelativeTime(session.timestamp)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            • {session.messageCount} messages
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {session.lastMessage}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 flex-shrink-0 hover:bg-gray-300 dark:hover:bg-gray-600"
                      >
                        <Trash2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      </Button>
                    </div>
                  </div>
                </SidebarMenuItem>
              ))}
              {filteredSessions.length === 0 && (
                <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-8">
                  {searchQuery ? 'No chats found' : 'No conversations yet'}
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-300 dark:border-gray-700 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
