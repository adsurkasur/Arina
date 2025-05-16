import { useState } from "react";
import { cn } from "@/lib/theme";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";

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
  setActiveTool,
}: MainLayoutProps) {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const openTool = (tool: string) => {
    setActiveTool(tool);
    setShowRightPanel(true);
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
          "flex-1 flex flex-col transition-all duration-200",
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
          {showRightPanel && !isMobile ? (
            <ResizablePanelGroup direction="horizontal">
              {/* Main Content */}
              <ResizablePanel defaultSize={60} minSize={40}>
                <div className="flex-1 flex flex-col h-full">
                  {children}
                </div>
              </ResizablePanel>

              {/* Tool Panel */}
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={40} minSize={30}>
                <div className="h-full bg-white border-l border-gray-200 overflow-y-auto custom-scrollbar">
                  {rightPanel}
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            /* When no tool panel or on mobile */
            <div className="flex-1 flex flex-col h-full">
              {children}
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
