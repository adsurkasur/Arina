import { useState } from "react";
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
  Plus
} from "lucide-react";
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
  const { conversations, createNewChat, loadConversation } = useChat();
  const [analysisToolsOpen, setAnalysisToolsOpen] = useState(true);

  // Handle toggling the sidebar on mobile
  const handleCloseSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
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
          <p className="text-xs text-white/70 mt-1">Your Agribusiness Tools</p>
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
                            <button
                              onClick={() => openTool("businessFeasibility")}
                              className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                            >
                              <Calculator className="h-5 w-5 mr-3" />
                              <span>Business Feasibility</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary"
                          >
                            <p>Analyze business profitability & ROI</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>

                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => openTool("demandForecasting")}
                              className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                            >
                              <ChartBar className="h-5 w-5 mr-3" />
                              <span>Demand Forecasting</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary"
                          >
                            <p>Forecast demand using historical data</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>

                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => openTool("optimizationAnalysis")}
                              className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                            >
                              <BarChart3 className="h-5 w-5 mr-3" />
                              <span>Optimization Analysis</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary"
                          >
                            <p>Optimize profit, cost & resources</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                      
                      <li>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => openTool("recommendations")}
                              className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                            >
                              <Lightbulb className="h-5 w-5 mr-3" />
                              <span>Smart Recommendations</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            side="right"
                            className="bg-cream text-primary"
                          >
                            <p>Personalized insights based on your data</p>
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
                  <button
                    key={conversation.id}
                    onClick={() => {
                      loadConversation(conversation.id);
                      if (isMobile) setIsOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-3 text-white/70" />
                    <span className="truncate">{conversation.title}</span>
                  </button>
                ))
              ) : (
                <p className="text-xs text-white/50 px-3 py-2">
                  No conversations yet
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
