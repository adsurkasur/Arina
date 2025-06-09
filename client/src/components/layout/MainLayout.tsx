import React, { useState, useRef } from "react";
import { cn } from "@/lib/theme";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationProvider, useNotification } from "@/contexts/NotificationContext";
import { NotificationSidePanel } from "@/components/ui/NotificationSidePanel";
import BusinessFeasibility from "@/components/tools/BusinessFeasibility";
import DemandForecasting from "@/components/tools/DemandForecasting";
import OptimizationAnalysis from "@/components/tools/OptimizationAnalysis";
import RecommendationDashboard from "@/components/recommendations/RecommendationDashboard";
import AnalysisHistory from "@/components/history/AnalysisHistory";
import UserProfile from "@/components/profile/UserProfile";
import SettingsPanel from "@/components/profile/SettingsPanel";
import { DebugPanel } from "@/components/ui/DebugPanel";
import HelpPanel from "@/components/ui/HelpPanel";

// --- Panel Registry ---
const PANEL_COMPONENTS: Record<string, React.ComponentType<{ onClose: () => void }>> = {
  notification: NotificationSidePanel,
  userProfile: UserProfile,
  businessFeasibility: BusinessFeasibility,
  demandForecasting: DemandForecasting,
  optimizationAnalysis: OptimizationAnalysis,
  recommendations: RecommendationDashboard,
  analysisHistory: AnalysisHistory,
  settings: SettingsPanel,
  debug: (props) => <DebugPanel {...props} />,
  help: HelpPanel,
};

export function MainLayout({
  children,
  setMainView,
}: {
  children: JSX.Element;
  setMainView?: (view: 'dashboard' | 'chat') => void;
}) {
  const { user } = useAuth();
  const isMobile = useMobile();
  const { unreadCount } = useNotification();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [lastPanel, setLastPanel] = useState<string | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // --- Centralized open/close logic ---
  const openPanel = (panel: string) => {
    setActivePanel(panel);
    setLastPanel(panel);
    setPanelVisible(true);
  };
  const closePanel = () => {
    setPanelVisible(false);
    // Do not clear activePanel/lastPanel yet
  };

  // --- Panel rendering logic ---
  const PanelComponent = activePanel ? PANEL_COMPONENTS[activePanel] : null;
  const LastPanelComponent = lastPanel ? PANEL_COMPONENTS[lastPanel] : null;

  // --- Handle transition end to clear activePanel after slide-out ---
  const handlePanelTransitionEnd = () => {
    if (!panelVisible) {
      setActivePanel(null);
      setLastPanel(null);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar Toggle for Mobile */}
      {isMobile && !sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 bg-white/80 rounded-md"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-5 w-5 text-primary" />
        </Button>
      )}
      {/* --- Unified Right Panel --- */}
      <div
        ref={panelRef}
        className={cn(
          "fixed top-16 right-0 h-[calc(100vh-4rem)] flex flex-col min-w-[340px] max-w-[420px] w-full sm:w-[380px] md:w-[400px] lg:w-[420px] z-40 bg-white transition-transform duration-300 will-change-transform",
          panelVisible ? "translate-x-0" : "translate-x-full"
        )}
        style={{ maxHeight: "calc(100vh - 4rem)" }}
        aria-hidden={!panelVisible}
        tabIndex={-1}
        onTransitionEnd={handlePanelTransitionEnd}
      >
        {/* Always render lastPanel content as long as lastPanel is set */}
        {lastPanel && LastPanelComponent && (
          <div style={{ height: '100%' }}>
            <LastPanelComponent onClose={closePanel} />
          </div>
        )}
      </div>
      {/* Sidebar and overlay rendered after right panel for correct stacking */}
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        openTool={openPanel}
        closePanel={closePanel}
        setMainView={setMainView || (() => {})}
        activePanel={activePanel}
        panelVisible={panelVisible}
      />
      <div
        className={cn(
          "flex-1 flex flex-col transition-[margin] duration-[300ms] ease-in-out bg-white",
          isMobile ? "ml-0" : sidebarOpen ? "ml-64" : "ml-0",
          "w-full",
        )}
      >
        <header
          className={cn(
            "bg-white border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-30 w-full left-0",
          )}
        >
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
            Arina
          </h1>
          <div className="ml-auto flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full"
              onClick={() => {
                if (activePanel === 'help' && panelVisible) {
                  closePanel();
                } else {
                  openPanel('help');
                }
              }}
            >
              <HelpCircle className="h-5 w-5 text-gray-600" />
            </Button>
            <div className="relative">
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => {
                if (activePanel === 'notification' && panelVisible) {
                  closePanel();
                } else {
                  openPanel('notification');
                }
              }}>
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center font-bold border border-white">{unreadCount}</span>
                )}
              </Button>
            </div>
            <Separator orientation="vertical" className="h-8 mx-1" />
            {user && <ProfileDropdown openTool={openPanel} />}
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden relative">
          <div
            className={cn(
              "flex-1 flex flex-col h-full bg-white/90 transition-[margin] duration-[300ms] ease-in-out",
              !isMobile && panelVisible ? "mr-[420px]" : "mr-0"
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MainLayoutWrapper(props: any) {
  return (
    <NotificationProvider>
      <MainLayout {...props} />
    </NotificationProvider>
  );
}
