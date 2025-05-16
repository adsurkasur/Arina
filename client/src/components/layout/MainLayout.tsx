import React, { useState } from "react";
import { cn } from "@/lib/theme";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";

// Fix: use global JSX.Element for props
export function MainLayout({
  children,
  rightPanel,
  showRightPanel,
  setShowRightPanel,
  setActiveTool,
}: {
  children: JSX.Element;
  rightPanel?: JSX.Element;
  showRightPanel?: boolean;
  setShowRightPanel?: (open: boolean) => void;
  setActiveTool?: (tool: string) => void;
}) {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const openTool = (tool: string) => {
    setActiveTool(tool);
    setShowRightPanel(true);
  };

  // Add: handle closing right panel
  const handleCloseRightPanel = () => {
    setShowRightPanel(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Sidebar Toggle for Mobile */}
      {isMobile && !sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white/80 shadow-sm rounded-md"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-primary" />
        </Button>
      )}

      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        openTool={openTool}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-500 ease-linear bg-white/90 backdrop-blur-sm",
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-0",
          "w-full",
        )}
      >
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-30">
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-3 text-primary"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <h1 className="text-xl font-heading font-semibold text-primary hidden md:block">
            ArinaAI
          </h1>
          <div className="ml-auto flex items-center space-x-3">
            <Button variant="outline" size="icon" className="rounded-full">
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-5 w-5 text-gray-600" />
            </Button>
            <Separator orientation="vertical" className="h-8 mx-1" />
            {user && <ProfileDropdown openTool={openTool} />}
          </div>
        </header>

        {/* Main Chat + Tools Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Desktop right panel with animation */}
          {!isMobile ? (
            <div className="flex-1 flex h-full relative">
              <div className={cn(
                "flex-1 flex flex-col h-full transition-all duration-500 ease-linear",
                showRightPanel ? "mr-96" : "mr-0"
              )}>
                {children}
              </div>
              {/* Right Sidebar */}
              <div
                className={cn(
                  "fixed top-0 right-0 h-full w-96 z-40 bg-white border-l border-gray-200 shadow-2xl transform transition-transform duration-500 ease-linear flex flex-col",
                  showRightPanel
                    ? "translate-x-0 animate-sidebar-in"
                    : "translate-x-full pointer-events-none animate-sidebar-out"
                )}
                style={{ willChange: "transform" }}
              >
                {/* Close button */}
                <button
                  className="absolute top-4 left-4 z-50 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 shadow"
                  onClick={handleCloseRightPanel}
                  aria-label="Close panel"
                  tabIndex={showRightPanel ? 0 : -1}
                >
                  <span className="text-xl font-bold">×</span>
                </button>
                <div className="flex-1 overflow-y-auto custom-scrollbar pt-14">
                  {rightPanel}
                </div>
              </div>
            </div>
          ) : (
            // Mobile right panel as overlay
            <>
              <div className="flex-1 flex flex-col h-full">
                {children}
              </div>
              {showRightPanel && (
                <>
                  <div
                    className={cn(
                      "fixed inset-0 z-50 bg-black/40 transition-opacity duration-300",
                      showRightPanel ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                    onClick={handleCloseRightPanel}
                  />
                  <div
                    className={cn(
                      "fixed top-0 right-0 h-full w-full max-w-[90vw] bg-white z-50 shadow-2xl transition-transform duration-500 ease-linear flex flex-col",
                      showRightPanel
                        ? "translate-x-0 animate-featurepanel-in"
                        : "translate-x-full pointer-events-none animate-featurepanel-out"
                    )}
                    style={{ willChange: "transform" }}
                  >
                    {/* Close button */}
                    <button
                      className="absolute top-4 left-4 z-50 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 shadow"
                      onClick={handleCloseRightPanel}
                      aria-label="Close panel"
                      tabIndex={showRightPanel ? 0 : -1}
                    >
                      <span className="text-xl font-bold">×</span>
                    </button>
                    <div className="flex-1 overflow-y-auto custom-scrollbar pt-14">
                      {rightPanel}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
