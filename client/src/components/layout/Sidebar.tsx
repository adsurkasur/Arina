import { useState, useRef } from "react";
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
import { InfoTooltip } from "@/components/ui/tooltip-info";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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
  const { user } = useAuth();
  const { conversations, createNewChat, loadConversation, renameConversation, deleteConversation } = useChat();
  const [analysisToolsOpen, setAnalysisToolsOpen] = useState(true);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<{id: string, title: string} | null>(null);
  const [newTitle, setNewTitle] = useState("");

  // Handle toggling the sidebar on mobile
  const handleCloseSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Handle opening the rename dialog
  const handleRenameClick = (conversation: {id: string, title: string}, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the conversation when clicking the menu
    setCurrentConversation(conversation);
    setNewTitle(conversation.title);
    setIsRenameDialogOpen(true);
  };

  // Handle submitting the rename dialog
  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentConversation && newTitle.trim()) {
      await renameConversation(currentConversation.id, newTitle.trim());
      setIsRenameDialogOpen(false);
    }
  };

  // Handle deleting a conversation
  const handleDeleteClick = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent loading the conversation when clicking the menu
    if (confirm("Are you sure you want to delete this conversation?")) {
      await deleteConversation(conversationId);
    }
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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2"></span> ArinaAI
            </h2>
          </div>
        </div>

        {/* Main Menu Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Analysis Tools Dropdown */}
          <div className="px-2 py-2">
            <Collapsible
              open={analysisToolsOpen}
              onOpenChange={setAnalysisToolsOpen}
              className="w-full"
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-white rounded-md hover:bg-white/10 transition-colors">
                <div className="flex items-center">
                  <span className="mr-2">Analysis Tools</span>
                </div>
                {analysisToolsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-2 mt-1">
                  <TooltipProvider>
                    <ul className="space-y-1">
                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                              <button
                                onClick={() => openTool("businessFeasibility")}
                                className="flex items-center flex-1"
                              >
                                <Calculator className="h-5 w-5 mr-3" />
                                <span>Business Feasibility Analysis</span>
                              </button>
                              <InfoTooltip content="Analyze your business's financial feasibility including investment costs, operational costs, break-even point, ROI, and payback period. Make informed decisions about your agricultural venture's viability." />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary max-w-[300px] p-3"
                          >
                            <p className="text-sm">
                              Analyze your business's financial feasibility including investment costs, operational costs, break-even point, ROI, and payback period. Make informed decisions about your agricultural venture's viability.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </li>

                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                              <button
                                onClick={() => openTool("demandForecasting")}
                                className="flex items-center flex-1"
                              >
                                <ChartBar className="h-5 w-5 mr-3" />
                                <span>Demand Forecasting</span>
                              </button>
                              <InfoTooltip content="Predict future market demand patterns for your agricultural products using your historical sales data, market trends, and seasonal variations to optimize production planning." />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary max-w-[300px] p-3"
                          >
                            <p className="text-sm">
                              Predict future market demand patterns for your agricultural products using your historical sales data, market trends, and seasonal variations to optimize production planning.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </li>

                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                              <button
                                onClick={() => openTool("optimizationAnalysis")}
                                className="flex items-center flex-1"
                              >
                                <BarChart3 className="h-5 w-5 mr-3" />
                                <span>Optimization Analysis</span>
                              </button>
                              <InfoTooltip content="Find the optimal balance of resources, crop selection, and production methods to maximize profits while minimizing costs. Uses advanced algorithms to help you make the most efficient decisions for your farm." />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary max-w-[300px] p-3"
                          >
                            <p className="text-sm">
                              Find the optimal balance of resources, crop selection, and production methods to maximize profits while minimizing costs. Uses advanced algorithms to help you make the most efficient decisions for your farm.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </li>

                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                              <button
                                onClick={() => openTool("recommendations")}
                                className="flex items-center flex-1"
                              >
                                <Lightbulb className="h-5 w-5 mr-3" />
                                <span>Smart Recommendations</span>
                              </button>
                              <InfoTooltip content="Receive personalized crop selection, business opportunity, and market entry recommendations based on your analysis history, local seasonal conditions, and current agricultural trends." />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary max-w-[300px] p-3"
                          >
                            <p className="text-sm">
                              Receive personalized crop selection, business opportunity, and market entry recommendations based on your analysis history, local seasonal conditions, and current agricultural trends.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </li>

                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors">
                              <button
                                onClick={() => openTool("analysisHistory")}
                                className="flex items-center flex-1"
                              >
                                <ClipboardList className="h-5 w-5 mr-3" />
                                <span>Analysis History</span>
                              </button>
                              <InfoTooltip content="Access and review all your previous business feasibility studies, demand forecasts, and optimization analyses with detailed visualizations and the ability to compare results over time." />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary max-w-[300px] p-3"
                          >
                            <p className="text-sm">
                              Access and review all your previous business feasibility studies, demand forecasts, and optimization analyses with detailed visualizations and the ability to compare results over time.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    </ul>
                  </TooltipProvider>
                </div>
              </CollapsibleContent>
            </Collapsible>


          </div>

          {/* Chat History Section */}
          <div className="px-2 py-2">
            <div className="flex items-center justify-between px-3 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Chat History
              </h3>
              <button
                onClick={createNewChat}
                className="h-6 w-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            <div className="mt-1 space-y-1">
              {conversations && conversations.length > 0 ? (
                conversations.map((conversation) => (
                  <div key={conversation.id} className="flex items-center relative group">
                    <button
                      onClick={() => {
                        loadConversation(conversation.id);
                        if (isMobile) setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                    >
                      <MessageSquare className="h-4 w-4 mr-3 text-white/70" />
                      <span className="truncate mr-6">{conversation.title}</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="absolute right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-sm hover:bg-white/20"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48" align="end">
                        <DropdownMenuItem
                          onClick={(e) => handleRenameClick(conversation, e)}
                          className="cursor-pointer"
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => handleDeleteClick(conversation.id, e)}
                          className="cursor-pointer text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/50 px-3 py-2">
                  No conversations yet
                </p>
              )}
            </div>

            {/* Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Rename Conversation</DialogTitle>
                  <DialogDescription>
                    Enter a new name for this conversation
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleRenameSubmit}>
                  <div className="flex items-center gap-4 py-2">
                    <Input
                      className="flex-1 text-black"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Enter new title"
                    />
                  </div>
                  <DialogFooter className="sm:justify-end">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setIsRenameDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={!newTitle.trim()}>
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* About Arina at bottom */}
        <div className="mt-auto px-3 pb-4">
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
              >
                <Info className="h-5 w-5 mr-3" />
                <span>About Arina</span>
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">Arina - AI-Powered Agricultural Analytics</DialogTitle>
                <DialogDescription>
                  A comprehensive platform for data-driven agricultural business decisions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Core Features</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Business feasibility analysis with ROI, payback period, break-even calculations</li>
                    <li>Demand forecasting to predict market trends using historical data</li>
                    <li>Optimization analysis for profit maximization and cost reduction</li>
                    <li>AI-powered recommendations based on analysis history and chat interactions</li>
                    <li>Interactive visualizations with crop seasonality awareness</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Technical Stack</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>React frontend with Tailwind CSS</li>
                    <li>Firebase Authentication for secure access</li>
                    <li>Google Gemini AI for intelligent assistant capabilities</li>
                    <li>PostgreSQL database for data persistence</li>
                    <li>Express API for backend services</li>
                  </ul>
                </div>
              </div>
              <DialogFooter className="sm:justify-start">
                <Button type="button" variant="default">
                  Learn More
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </aside>
    </>
  );
}