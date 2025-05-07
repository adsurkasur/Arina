import { useState } from "react";
import { cn } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  ArrowLeftCircle, 
  MessageSquare, 
  PlusCircle, 
  BarChart3, 
  LineChart, 
  PieChart, 
  Settings, 
  LogOut, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Sprout
} from "lucide-react";

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  openTool: (tool: string) => void;
}

export function Sidebar({ isMobile, isOpen, setIsOpen, openTool }: SidebarProps) {
  const { user, logout } = useAuth();
  const { 
    conversations, 
    activeConversation, 
    createNewChat, 
    loadConversation, 
    renameConversation,
    deleteConversation 
  } = useChat();
  
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [chatTitle, setChatTitle] = useState("");
  
  const handleStartNewChat = async () => {
    await createNewChat();
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const handleOpenChat = async (id: string) => {
    await loadConversation(id);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  const handleEditChat = (id: string, title: string) => {
    setEditingChat(id);
    setChatTitle(title);
  };
  
  const handleSaveTitle = async (id: string) => {
    if (chatTitle.trim()) {
      await renameConversation(id, chatTitle);
    }
    setEditingChat(null);
  };
  
  const handleOpenTool = (tool: string) => {
    openTool(tool);
    if (isMobile) {
      setIsOpen(false);
    }
  };
  
  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out flex flex-col h-full",
        isMobile && !isOpen && "-translate-x-full",
        isMobile && isOpen && "translate-x-0",
        !isMobile && "translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
          <div className="flex items-center">
            <Sprout className="h-5 w-5 text-sidebar-accent mr-2" />
            <h1 className="font-heading font-bold text-xl text-white">Arina</h1>
          </div>
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-sidebar-primary"
            >
              <ArrowLeftCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        {/* User profile */}
        <div className="p-4 flex items-center space-x-3 border-b border-sidebar-border">
          <Avatar>
            <AvatarImage src={user?.photoURL} alt={user?.name} />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-foreground">
              {user?.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="font-medium text-sidebar-foreground text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-300 truncate">{user?.email}</p>
          </div>
        </div>
        
        {/* New Chat Button */}
        <div className="p-4">
          <Button 
            className="w-full bg-sidebar-primary hover:bg-sidebar-primary/80 text-white"
            onClick={handleStartNewChat}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New chat
          </Button>
        </div>
        
        {/* Chat History */}
        <div className="overflow-y-auto custom-scrollbar flex-grow px-2">
          <div className="px-2 py-2 text-xs text-gray-300 uppercase">Recent Chats</div>
          
          {conversations.length === 0 && (
            <div className="text-center p-4 text-gray-300 text-sm">
              No chat history yet
            </div>
          )}
          
          {conversations.map(chat => (
            <div key={chat.id} className="my-1">
              {editingChat === chat.id ? (
                <div className="flex items-center p-1">
                  <input
                    type="text"
                    value={chatTitle}
                    onChange={(e) => setChatTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(chat.id)}
                    className="flex-1 bg-sidebar-primary text-white text-sm p-2 rounded-md"
                    autoFocus
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleSaveTitle(chat.id)}
                    className="ml-1 text-white hover:bg-sidebar-primary h-8"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div 
                  className={cn(
                    "flex items-center group p-2 rounded-lg hover:bg-sidebar-primary cursor-pointer",
                    activeConversation?.id === chat.id && "bg-sidebar-primary"
                  )}
                  onClick={() => handleOpenChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2 text-gray-300" />
                  <span className="truncate text-sidebar-foreground text-sm flex-1">
                    {chat.title}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-white hover:bg-sidebar-primary"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditChat(chat.id, chat.title);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(chat.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          ))}
        </div>
        
        {/* Tools Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-gray-300 uppercase mb-2">Analysis Tools</div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-primary mb-1"
            onClick={() => handleOpenTool('businessFeasibility')}
          >
            <LineChart className="h-4 w-4 mr-2" />
            Business Feasibility
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-primary mb-1"
            onClick={() => handleOpenTool('demandForecasting')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Demand Forecasting
          </Button>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-primary mb-1"
            onClick={() => handleOpenTool('optimizationAnalysis')}
          >
            <PieChart className="h-4 w-4 mr-2" />
            Optimization Analysis
          </Button>
        </div>
        
        {/* Settings */}
        <div className="p-4 border-t border-sidebar-border">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-primary mb-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Coming soon
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-300 hover:bg-sidebar-primary hover:text-red-200"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
