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
}

export function Sidebar({
  isOpen,
  setIsOpen,
  isMobile,
  openTool,
}: SidebarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const {
    conversations,
    createNewChat,
    loadConversation,
    renameConversation,
    deleteConversation,
  } = useChat();
  const [analysisToolsOpen, setAnalysisToolsOpen] = useState(true);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
  const [debugPanelOpen, setDebugPanelOpen] = useState(false);

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
    e.stopPropagation(); // Prevent loading the conversation when clicking the menu
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
    e.stopPropagation(); // Prevent loading the conversation when clicking the menu
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
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Sidebar */}
      <div className={cn(
        // Use semantic bg/text and dark mode classes
        "fixed inset-y-0 left-0 z-50 w-64 bg-background text-foreground dark:bg-background dark:text-foreground transform transition-transform duration-[300ms] ease-in-out flex flex-col shadow-2xl border-r border-border",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border">
          <div className="flex justify-between items-center">
            <h2
              className="text-xl font-bold flex items-center font-sans cursor-pointer"
              onClick={() => setDebugPanelOpen((v) => !v)}
              title="Open Debugging Panel"
            >
              <span className="mr-2"></span> Arina
            </h2>
          </div>
        </div>

        {/* Main Menu Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar transition-all duration-[200ms] font-sans">
          {/* Dashboard Menu Item */}
          <div className="px-2 py-2">
            <button
              onClick={() => openTool("dashboard")}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors mb-2"
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              <span>{t('sidebar.dashboard')}</span>
            </button>
          </div>
          {/* Analysis Tools Dropdown */}
          <div className="px-2 py-2">
            <Collapsible
              open={analysisToolsOpen}
              onOpenChange={setAnalysisToolsOpen}
              className="w-full"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors font-sans">
                <div className="flex items-center">
                  <span className="mr-2">{t('sidebar.analysisTools')}</span>
                </div>
                {analysisToolsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              {/* Animate dropdown with slide/fade */}
              <CollapsibleContent
                className="overflow-hidden transition-all duration-[200ms] data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp"
              >
                <div className="pl-2 mt-1">
                  <ul className="space-y-1">
                    <li>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openTool("businessFeasibility")}
                            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
                          >
                            <Calculator className="h-5 w-5 mr-3" />
                            <span>{t('sidebar.businessFeasibility')}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-card text-foreground max-w-[300px] p-3 font-body border border-border"
                        >
                          <p className="text-sm">
                            {t('sidebar.businessFeasibilityDescription')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </li>

                    <li>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openTool("demandForecasting")}
                            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
                          >
                            <ChartBar className="h-5 w-5 mr-3" />
                            <span>{t('sidebar.demandForecasting')}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-card text-foreground max-w-[300px] p-3 font-body border border-border"
                        >
                          <p className="text-sm">
                            {t('sidebar.demandForecastingDescription')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </li>

                    <li>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openTool("optimizationAnalysis")}
                            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
                          >
                            <BarChart3 className="h-5 w-5 mr-3" />
                            <span>{t('sidebar.optimizationAnalysis')}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-card text-foreground max-w-[300px] p-3 font-body border border-border"
                        >
                          <p className="text-sm">
                            {t('sidebar.optimizationAnalysisDescription')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </li>

                    <li>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openTool("recommendations")}
                            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
                          >
                            <Lightbulb className="h-5 w-5 mr-3" />
                            <span>{t('sidebar.smartRecommendations')}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-card text-foreground max-w-[300px] p-3 font-body border border-border"
                        >
                          <p className="text-sm">
                            {t('sidebar.smartRecommendationsDescription')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </li>

                    <li>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => openTool("analysisHistory")}
                            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
                          >
                            <ClipboardList className="h-5 w-5 mr-3" />
                            <span>{t('sidebar.analysisHistory')}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent
                          side="right"
                          className="bg-card text-foreground max-w-[300px] p-3 font-body border border-border"
                        >
                          <p className="text-sm">
                            {t('sidebar.analysisHistoryDescription')}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Chat History Section */}
          <div className="px-2 py-2">
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('sidebar.chatHistory')}
              </h3>
              <button
                onClick={() => {
                  createNewChat();
                  if (openTool) openTool(""); // Ensure dashboard is closed
                  if (isMobile) setIsOpen(false);
                }}
                className="h-6 w-6 flex items-center justify-center rounded-full bg-accent/20 dark:bg-accent/30 hover:bg-accent/40 dark:hover:bg-accent/50 transition-colors"
                aria-label={t('sidebar.newChat')}
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-1 space-y-1">
              {conversations && conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className="flex items-center relative group"
                  >
                    <button
                      onClick={() => {
                        loadConversation(conversation.id);
                        if (openTool) openTool(""); // Ensure dashboard is closed
                        if (isMobile) setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-3 text-foreground" />
                      <span className="truncate mr-6">
                        {conversation.title}
                      </span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-sm hover:bg-accent/20 dark:hover:bg-accent/30"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4 text-foreground" />
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
                <p className="text-xs text-muted-foreground px-3 py-2">
                  {t('sidebar.noConversations')}
                </p>
              )}
            </div>

            {/* Rename Dialog */}
            <Dialog
              open={isRenameDialogOpen}
              onOpenChange={setIsRenameDialogOpen}
            >
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
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{t('sidebar.deleteConversation')}</DialogTitle>
                  <DialogDescription>
                    {t('sidebar.confirmDelete')}
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelDelete}
                  >
                    {t('sidebar.cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    {t('sidebar.delete')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Debugging Side Panel */}
        {/* <DebugPanel open={debugPanelOpen} onClose={() => setDebugPanelOpen(false)} /> */}
        {/* Debug menu item: open DebugPanel as right panel */}
        <div className="px-2 py-2">
          <button
            onClick={() => openTool("debug")}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors mb-2"
            title="Open Debugging Panel"
          >
            <PanelLeft className="h-5 w-5 mr-3" />
            <span>{t('sidebar.debugging')}</span>
          </button>
        </div>

        {/* About Arina at bottom */}
        <div className="mt-auto px-3 pb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-accent/10 dark:hover:bg-accent/20 transition-colors">
                <Info className="h-5 w-5 mr-3" />
                <span>{t('sidebar.aboutArina')}</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {t('sidebar.arinaTitle')}
                </DialogTitle>
                <DialogDescription>
                  {t('sidebar.arinaDescription')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">{t('sidebar.coreFeatures')}</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>
                      {t('sidebar.feasibilityAnalysis')}
                    </li>
                    <li>
                      {t('sidebar.demandForecastingFeature')}
                    </li>
                    <li>
                      {t('sidebar.optimizationAnalysisFeature')}
                    </li>
                    <li>
                      {t('sidebar.aiRecommendations')}
                    </li>
                    <li>
                      {t('sidebar.visualizations')}
                    </li>
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
      </div>
    </>
  );
}
