import React, { useState } from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { Plus, MessageSquare, Settings, Trash2 } from 'lucide-react';
import UserMenu from '@/components/UserMenu';

interface Chat {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
}

interface AppSidebarProps {
  onNewChat: () => void;
  onChatSelect?: (chatId: string) => void;
  currentChatId?: string;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ onNewChat, onChatSelect, currentChatId }) => {
  const [recentChats] = useState<Chat[]>([
    {
      id: '1',
      title: 'Chat about React',
      lastMessage: 'How do I use hooks?',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      title: 'JavaScript Questions',
      lastMessage: 'What is async/await?',
      timestamp: '1 day ago'
    },
    {
      id: '3',
      title: 'CSS Help',
      lastMessage: 'Flexbox vs Grid?',
      timestamp: '3 days ago'
    }
  ]);

  const handleChatClick = (chatId: string) => {
    onChatSelect?.(chatId);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    console.log('Delete chat:', chatId);
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
            {recentChats.map((chat) => (
              <SidebarMenuItem key={chat.id}>
                <SidebarMenuButton
                  onClick={() => handleChatClick(chat.id)}
                  className={`w-full group relative flex flex-col items-start p-3 rounded-lg transition-colors hover:bg-gray-800 ${
                    currentChatId === chat.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-white font-medium truncate flex-1">
                      {chat.title}
                    </span>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-700 rounded transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                  <div className="w-full mt-1 pl-6">
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {chat.timestamp}
                    </p>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
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
