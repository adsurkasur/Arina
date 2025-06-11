import React, { useState, useRef } from "react";
import type { MouseEvent, FormEvent } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/theme";
import {
  Calculator,
  ChartBar,
  BarChart3,
  Settings,
  X,
  User,
  PanelLeft,
  Menu,
  Lightbulb,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Clock,
  Plus,
  MoreVertical,
  Pencil,
  Share,
  Trash2,
  Archive,
  History,
  ClipboardList,
  Info,
  LayoutDashboard,
  ChevronsUp,
  Newspaper,
  Sprout,
  Wrench,
  Cpu,
  Book
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatConversation } from "@/types";
import { useNotification } from "@/contexts/NotificationContext";
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
  openTool: (tool: string) => void;
  closePanel: () => void;
  setMainView: (view: 'dashboard' | 'chat' | 'dashboardOverview' | 'dashboardNews' | 'dashboardAgriData' | 'dashboardDevices') => void;
  activePanel?: string | null;
  panelVisible?: boolean;
}

export function Sidebar({
  isOpen,
  setIsOpen,
  isMobile,
  openTool,
  closePanel,
  setMainView,
  activePanel,
  panelVisible,
}: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    conversations,
    createNewChat,
    loadConversation,
    renameConversation,
    deleteConversation,
    clearActiveConversation,
  } = useChat();
  const [analysisToolsOpen, setAnalysisToolsOpen] = useState(true);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(true); // Add state for chat history dropdown

  // Handle toggling the sidebar on mobile
  const handleCloseSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Handle opening the rename dialog
  const handleRenameClick = (
    conversation: ChatConversation,
    e: any,
  ) => {
    e.stopPropagation();
    setCurrentConversation(conversation);
    setNewTitle(conversation.title);
    setIsRenameDialogOpen(true);
  };

  // Handle submitting the rename dialog
  const handleRenameSubmit = async (e: any) => {
    e.preventDefault();
    if (currentConversation && newTitle.trim()) {
      await renameConversation(currentConversation.id, newTitle.trim());
      setIsRenameDialogOpen(false);
    }
  };

  // Open delete dialog
  const handleDeleteClick = (conversationId: string, e: any) => {
    e.stopPropagation();
    setConversationToDelete(conversationId);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (conversationToDelete) {
      await deleteConversation(conversationToDelete);
      setConversationToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setConversationToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      {/* Custom styles for scrollbar */}
      <style>{`
        .sidebar-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 197, 94, 0.3) transparent;
        }
        .sidebar-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(34, 197, 94, 0.3);
          border-radius: 3px;
          border: none;
        }
        .sidebar-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(34, 197, 94, 0.5);
        }
        
        /* Logo animation */
        .logo-pulse {
          animation: logo-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes logo-pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
      `}</style>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-[300ms] ease-in-out flex flex-col",
        isOpen
          ? "translate-x-0"
          : "-translate-x-full",
      )}>
        {/* Sidebar Header */}
        <div className="p-4 flex-shrink-0 border-b border-white/10">
          <div className="flex justify-between items-center">
            <div
              className="flex items-center cursor-pointer group"
              onClick={() => setDebugPanelOpen((v) => !v)}
              title="Open Debugging Panel"
            >
              {/* Logo/Favicon */}
              <div className="relative mr-3">
                <div className="">
                  <Sprout className="h-5 w-5 text-white" />
                </div>
              </div>
              
              {/* App Name */}
              <h2 className="text-xl font-bold font-sans text-white truncate">
                {t('sidebar.appName')}
              </h2>
            </div>
            
            {isMobile && (
              <button
                className="p-1 rounded-md hover:bg-white/10 transition-colors"
                title={t('sidebar.closeSidebar')}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Optional: Add subtitle or version */}
          <div className="mt-1">
            <p className="text-xs text-white/60 font-medium">
              {t('sidebar.appSubtitle')}
            </p>
          </div>
        </div>

        {/* Main Menu Section */}
        <div className="flex-1 overflow-y-auto sidebar-scrollbar">
          <div className="pb-4 pt-2">
            {/* Overview Menu Item (match style with dropdown triggers) */}
            <div className="px-2 pb-2">
              <button
                onClick={() => {
                  setMainView('dashboardOverview');
                  handleCloseSidebar();
                }}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors font-sans"
              >
                <div className="flex items-center">
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  <span>{t('sidebar.dashboardOverview')}</span>
                </div>
              </button>
            </div>

            {/* Dashboard Dropdown */}
            <div className="px-2 pb-2">
              <Collapsible
                open={dashboardOpen}
                onOpenChange={setDashboardOpen}
                className="w-full"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors font-sans">
                  <div className="flex items-center">
                    <Book className="h-5 w-5 mr-3" />
                    <span>{t('sidebar.infoHub')}</span>
                  </div>
                  {dashboardOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden transition-all duration-[200ms] data-[state=open]:animate-slideDown data-[state=closed]:animate-slide-up">
                  <div className="pl-6 mt-1 space-y-1">
                    {/* Remove Overview button from dropdown */}
                    <button
                      onClick={() => {
                        setMainView('dashboardNews');
                        handleCloseSidebar();
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Newspaper className="h-4 w-4 mr-3 text-white/70" />
                      <span>{t('sidebar.dashboardNews')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMainView('dashboardAgriData');
                        handleCloseSidebar();
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                    >
                      <ClipboardList className="h-4 w-4 mr-3 text-white/70" />
                      <span>{t('sidebar.dashboardAgriData')}</span>
                    </button>
                    <button
                      onClick={() => {
                        setMainView('dashboardDevices');
                        handleCloseSidebar();
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                    >
                      <Cpu className="h-4 w-4 mr-3 text-white/70" />
                      <span>{t('sidebar.dashboardDevices')}</span>
                    </button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Analysis Tools Dropdown */}
            <div className="px-2 pb-2">
              <Collapsible
                open={analysisToolsOpen}
                onOpenChange={setAnalysisToolsOpen}
                className="w-full"
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors font-sans">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 mr-3" />
                    <span>{t('sidebar.analysisTools')}</span>
                  </div>
                  {analysisToolsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden transition-all duration-[200ms] data-[state=open]:animate-slideDown data-[state=closed]:animate-slide-up">
                  <div className="pl-6 mt-1 space-y-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (activePanel === "businessFeasibility" && panelVisible) {
                              closePanel();
                            } else {
                              openTool("businessFeasibility");
                            }
                            handleCloseSidebar();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                        >
                          <Calculator className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" />
                          <span className="text-left">{t('sidebar.businessFeasibility')}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-cream text-primary max-w-[300px] p-3 font-body"
                      >
                        <p className="text-sm">
                          {t('sidebar.businessFeasibilityDescription')}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (activePanel === "demandForecasting" && panelVisible) {
                              closePanel();
                            } else {
                              openTool("demandForecasting");
                            }
                            handleCloseSidebar();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                        >
                          <BarChart3 className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" />
                          <span className="text-left">{t('sidebar.demandForecasting')}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-cream text-primary max-w-[300px] p-3 font-body"
                      >
                        <p className="text-sm">
                          {t('sidebar.demandForecastingDescription')}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (activePanel === "optimizationAnalysis" && panelVisible) {
                              closePanel();
                            } else {
                              openTool("optimizationAnalysis");
                            }
                            handleCloseSidebar();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                        >
                          <ChevronsUp className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" />
                          <span className="text-left">{t('sidebar.optimizationAnalysis')}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-cream text-primary max-w-[300px] p-3 font-body"
                      >
                        <p className="text-sm">
                          {t('sidebar.optimizationAnalysisDescription')}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (activePanel === "recommendations" && panelVisible) {
                              closePanel();
                            } else {
                              openTool("recommendations");
                            }
                            handleCloseSidebar();
                          }}
                          className="flex items-start w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                        >
                          <Lightbulb className="h-4 w-4 mr-3 flex-shrink-0 mt-0.5 text-white/70" />
                          <span className="text-left leading-tight">
                            <span className="block">{t('sidebar.smartRecommendations')}</span>
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-cream text-primary max-w-[300px] p-3 font-body"
                      >
                        <p className="text-sm">
                          {t('sidebar.smartRecommendationsDescription')}
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (activePanel === "analysisHistory" && panelVisible) {
                              closePanel();
                            } else {
                              openTool("analysisHistory");
                            }
                            handleCloseSidebar();
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                        >
                          <History className="h-4 w-4 mr-3 flex-shrink-0 text-white/70" />
                          <span className="text-left">{t('sidebar.analysisHistory')}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="bg-cream text-primary max-w-[300px] p-3 font-body"
                      >
                        <p className="text-sm">
                          {t('sidebar.analysisHistoryDescription')}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>

            {/* Chat History Section with Dropdown */}
            <div className="px-2 pb-2">
              <Collapsible
                open={chatHistoryOpen}
                onOpenChange={setChatHistoryOpen}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <div className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors font-sans cursor-pointer">
                    <div className="flex items-center">
                      <History className="h-5 w-5 mr-3" />
                      <span>{t('sidebar.chatHistory')}</span>
                      {conversations && conversations.length > 0 && (
                        <span className="ml-2 bg-white/20 text-xs px-2 py-0.5 rounded-full">
                          {conversations.length}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Add New Chat Button */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await createNewChat();
                          setMainView("chat");
                          handleCloseSidebar();
                        }}
                        className="h-6 w-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        aria-label={t('sidebar.newChat')}
                        title={t('sidebar.newChat')}
                        type="button"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                      {/* Dropdown Arrow */}
                      {chatHistoryOpen ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="overflow-hidden transition-all duration-[200ms] data-[state=open]:animate-slideDown data-[state=closed]:animate-slide-up">
                  <div className="pl-6 mt-1 space-y-1 max-h-48 overflow-y-auto sidebar-scrollbar">
                    {conversations && conversations.length > 0 ? (
                      conversations.map((conversation) => (
                        // Each conversation row: main button and menu button are siblings, not nested
                        <div
                          key={conversation.id}
                          className="flex items-center relative group"
                        >
                          {/* Main conversation button */}
                          <button
                            onClick={() => {
                              setMainView("chat");
                              loadConversation(conversation.id);
                              handleCloseSidebar();
                            }}
                            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4 mr-3 text-white/50 flex-shrink-0" />
                            <span className="truncate mr-6 text-left">
                              {conversation.title}
                            </span>
                          </button>
                          {/* Action menu button (DropdownMenuTrigger) is a sibling, not a child, of the main button */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-sm hover:bg-white/20 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4 text-white/70" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={(e: any) => handleRenameClick(conversation as ChatConversation, e)}
                                className="cursor-pointer"
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                {t('sidebar.rename')}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={(e: any) => handleDeleteClick(conversation.id, e)}
                                className="cursor-pointer text-red-500 focus:text-red-500"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {t('sidebar.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-4 text-center">
                        <MessageSquare className="h-8 w-8 text-white/30 mx-auto mb-2" />
                        <p className="text-xs text-white/50 mb-2">
                          {t('sidebar.noConversations')}
                        </p>
                        <button
                          onClick={async () => {
                            await createNewChat();
                            setMainView("chat");
                            handleCloseSidebar();
                          }}
                          className="text-xs text-green-300 hover:text-green-200 underline transition-colors"
                        >
                          {t('sidebar.startFirstChat')}
                        </button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex-shrink-0 border-t border-white/10 p-2">
          {/* Debug Panel */}
          <button
            onClick={() => {
              if (activePanel === "debug" && panelVisible) {
                openTool("");
              } else {
                openTool("debug");
              }
              handleCloseSidebar();
            }}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors mb-2"
            title="Open Debugging Panel"
          >
            <PanelLeft className="h-5 w-5 mr-3" />
            <span>{t('sidebar.debugging')}</span>
          </button>

          {/* About Arina */}
          <Dialog>
            <DialogTrigger asChild>
              <span>
                <button className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                  <Info className="h-5 w-5 mr-3" />
                  <span>{t('sidebar.aboutArina')}</span>
                </button>
              </span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <Sprout className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {t('sidebar.arinaTitle')}
                    </DialogTitle>
                    <p className="text-sm text-gray-600">{t('sidebar.appSubtitle')}</p>
                  </div>
                </div>
                <DialogDescription>
                  {t('sidebar.arinaDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{t('sidebar.coreFeatures')}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>{t('sidebar.feasibilityAnalysis')}</li>
                    <li>{t('sidebar.demandForecastingFeature')}</li>
                    <li>{t('sidebar.optimizationAnalysisFeature')}</li>
                    <li>{t('sidebar.aiRecommendations')}</li>
                    <li>{t('sidebar.visualizations')}</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">{t('sidebar.technicalStack')}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>{t('sidebar.reactTailwind')}</li>
                    <li>{t('sidebar.firebaseAuth')}</li>
                    <li>{t('sidebar.googleGemini')}</li>
                    <li>{t('sidebar.postgresql')}</li>
                    <li>{t('sidebar.expressAPI')}</li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button type="button" variant="default">
                  {t('sidebar.learnMore')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Rename Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('sidebar.renameConversation')}</DialogTitle>
              <DialogDescription>
                {t('sidebar.enterNewName')}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRenameSubmit}>
              <div className="flex items-center gap-4 py-2">
                <Input
                  value={newTitle}
                  onChange={(e: any) => setNewTitle(e.target.value)}
                  className="flex-1 text-black"
                  placeholder={t('sidebar.enterNewTitle')}
                />
              </div>
              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsRenameDialogOpen(false)}
                >
                  {t('sidebar.cancel')}
                </Button>
                <Button type="submit" disabled={!newTitle.trim()}>
                  {t('sidebar.saveChanges')}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('sidebar.deleteConversation')}</DialogTitle>
              <DialogDescription>
                {t('sidebar.confirmDelete')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-end">
              <Button type="button" variant="outline" onClick={cancelDelete}>
                {t('sidebar.cancel')}
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete}>
                {t('sidebar.delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
