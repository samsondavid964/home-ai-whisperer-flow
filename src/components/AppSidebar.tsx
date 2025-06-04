
import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
  messageCount: number;
  messages: any[];
}

interface AppSidebarProps {
  currentSessionId: string;
  onNewChat: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  sessions: ChatSession[];
}

const AppSidebar: React.FC<AppSidebarProps> = ({ 
  currentSessionId, 
  onNewChat, 
  onSelectSession, 
  onDeleteSession, 
  sessions 
}) => {
  const handleChatClick = (sessionId: string) => {
    onSelectSession(sessionId);
  };

  const handleDeleteChat = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Sidebar className="bg-gray-950 border-r border-gray-800">
      <SidebarHeader className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Chat AI</h1>
          <UserMenu />
        </div>
        <button
          onClick={onNewChat}
          className="w-full mt-3 flex items-center gap-2 px-3 py-2 text-sm text-gray-300 bg-gray-900 hover:bg-gray-800 rounded-lg border border-gray-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-gray-400 mb-3">Recent Chats</h2>
          <SidebarMenu>
            {sessions.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">
                No conversations yet
              </div>
            ) : (
              sessions.map((session) => (
                <SidebarMenuItem key={session.id}>
                  <SidebarMenuButton
                    onClick={() => handleChatClick(session.id)}
                    className={`w-full group relative flex flex-col items-start p-3 rounded-lg transition-colors hover:bg-gray-800 ${
                      currentSessionId === session.id ? 'bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-white font-medium truncate flex-1">
                        {session.title}
                      </span>
                      <button
                        onClick={(e) => handleDeleteChat(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                      </button>
                    </div>
                    <div className="w-full mt-1 pl-6">
                      <p className="text-xs text-gray-500 truncate">
                        {session.lastMessage || 'No messages yet'}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {formatTimestamp(session.timestamp)}
                      </p>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
            )}
          </SidebarMenu>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-800">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="w-full flex items-center gap-2 p-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
