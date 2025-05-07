import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/theme";
import {
  Calculator,
  ChartBar,
  BarChart3,
  Settings,
  LogOut,
  X,
  User,
  PanelLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isMobile: boolean;
  openTool: (tool: string) => void;
}

export function Sidebar({ isOpen, setIsOpen, isMobile, openTool }: SidebarProps) {
  const { user, logout } = useAuth();
  
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transform transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0"
        )}
      >
        {/* Mobile Close Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-primary-foreground/10 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        )}
        
        {/* Sidebar Header */}
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <span className="mr-2">🌱</span> Arina
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-primary-foreground/10"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-white/70 mt-1">
            Agricultural Intelligence Platform
          </p>
        </div>
        
        {/* Profile Section */}
        <div className="px-4 py-2 border-t border-white/10">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-primary font-semibold overflow-hidden">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="ml-3 truncate">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-white/70 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Tools Section */}
        <div className="px-2 py-4 flex-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 px-3 mb-2">
            Analysis Tools
          </h3>
          
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
                  <TooltipContent side="right" className="bg-cream text-primary">
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
                  <TooltipContent side="right" className="bg-cream text-primary">
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
                  <TooltipContent side="right" className="bg-cream text-primary">
                    <p>Optimize profit, cost & resources</p>
                  </TooltipContent>
                </Tooltip>
              </li>
            </ul>
          </TooltipProvider>
        </div>
        
        {/* Footer Section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}