import { useState } from "react";
import { cn } from "@/lib/theme";
import { useMobile } from "@/hooks/use-mobile";
import { Sidebar } from "./Sidebar";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;
  setActiveTool: (tool: string | null) => void;
}

export function MainLayout({ 
  children, 
  rightPanel, 
  showRightPanel, 
  setShowRightPanel,
  setActiveTool
}: MainLayoutProps) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  const openTool = (tool: string) => {
    setActiveTool(tool);
    setShowRightPanel(true);
  };
  
  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Sidebar Toggle for Mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5 text-primary" />
      </Button>
      
      {/* Sidebar */}
      <Sidebar 
        isMobile={isMobile} 
        isOpen={sidebarOpen} 
        setIsOpen={setSidebarOpen}
        openTool={openTool}
      />
      
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col",
        !isMobile && "ml-64",
      )}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-30">
          <h1 className="text-xl font-heading font-semibold text-primary hidden md:block">
            Agricultural Intelligence Platform
          </h1>
          <div className="ml-auto flex items-center space-x-4">
            <Button variant="outline" size="icon" className="rounded-full">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </header>
        
        {/* Quick Access Tools Bar */}
        <div className="bg-white px-4 py-3 border-b border-gray-200 overflow-x-auto flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Quick access:</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-cream hover:bg-cream-dark text-primary rounded-full text-sm flex items-center whitespace-nowrap"
            onClick={() => openTool('businessFeasibility')}
          >
            <span className="mr-1.5">📊</span>
            Feasibility
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-cream hover:bg-cream-dark text-primary rounded-full text-sm flex items-center whitespace-nowrap"
            onClick={() => openTool('demandForecasting')}
          >
            <span className="mr-1.5">📈</span>
            Forecasting
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-cream hover:bg-cream-dark text-primary rounded-full text-sm flex items-center whitespace-nowrap"
            onClick={() => {
              setActiveTool('optimizationAnalysis');
              setShowRightPanel(true);
            }}
          >
            <span className="mr-1.5">💰</span>
            Profit Max
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-cream hover:bg-cream-dark text-primary rounded-full text-sm flex items-center whitespace-nowrap"
            onClick={() => {
              setActiveTool('optimizationAnalysis');
              setShowRightPanel(true);
            }}
          >
            <span className="mr-1.5">📉</span>
            Cost Min
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-cream hover:bg-cream-dark text-primary rounded-full text-sm flex items-center whitespace-nowrap"
            onClick={() => {
              setActiveTool('optimizationAnalysis');
              setShowRightPanel(true);
            }}
          >
            <span className="mr-1.5">🎯</span>
            Goal Programming
          </Button>
        </div>
        
        {/* Main Chat + Tools Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 flex flex-col h-full">
            {children}
          </div>
          
          {/* Tool Panel (shown when a tool is selected) */}
          {showRightPanel && !isMobile && (
            <div className="w-2/5 bg-white border-l border-gray-200 overflow-y-auto custom-scrollbar">
              {rightPanel}
            </div>
          )}
          
          {/* Mobile Tool Panel (as overlay when shown) */}
          {showRightPanel && isMobile && (
            <div className="fixed inset-0 bg-white z-50 overflow-y-auto custom-scrollbar">
              {rightPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
