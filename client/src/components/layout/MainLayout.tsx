import React, { useState } from "react";
import { cn } from "@/lib/theme";
import { useMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar } from "./Sidebar";
import { ProfileDropdown } from "./ProfileDropdown";
import { Menu, Bell, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NotificationProvider, useNotification, NOTIFICATION_DURATION } from "@/contexts/NotificationContext";
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

// Fix: use global JSX.Element for props
export function MainLayout({
  children,
  setMainView,
}: {
  children: JSX.Element;
  setMainView?: (view: 'dashboard' | 'chat') => void;
}) {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [notifPanelOpen, setNotifPanelOpen] = useState(false);
  const { unreadCount } = useNotification();
  const [activePanel, setActivePanel] = useState<string | null>(null);

  // --- Centralized open/close logic ---
  const openPanel = (panel: string) => {
    setNotifPanelOpen(false);
    setActivePanel((prev) => (prev === panel ? null : panel));
  };
  const closePanel = () => {
    setActivePanel(null);
    setNotifPanelOpen(false);
  };
  const openNotifPanel = () => {
    setActivePanel(null);
    setNotifPanelOpen(true);
  };

  // --- Panel rendering logic ---
  const PanelComponent = activePanel ? PANEL_COMPONENTS[activePanel] : null;
  const isPanelOpen = !!activePanel;

  return (
    <div className="flex h-screen overflow-hidden bg-white">
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
      <Sidebar
        isMobile={isMobile}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        openTool={openPanel}
        setMainView={setMainView || (() => {})}
        activePanel={activePanel}
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
            "bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-4 sticky top-0 z-30 w-full left-0",
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
                if (notifPanelOpen) setNotifPanelOpen(false);
                if (activePanel === 'help' && isPanelOpen) {
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
                if (notifPanelOpen) {
                  setNotifPanelOpen(false);
                } else {
                  openNotifPanel();
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
          <div className="flex-1 flex flex-col h-full bg-white/90">
            {children}
          </div>
          {/* --- Unified Right Panel --- */}
          <div
            className={cn(
              "absolute top-0 right-0 h-full flex flex-col min-w-[340px] max-w-[420px] w-full sm:w-[380px] md:w-[400px] lg:w-[420px] z-40 bg-white shadow-2xl transition-transform duration-300",
              notifPanelOpen || isPanelOpen ? "translate-x-0" : "translate-x-full",
              "will-change-transform"
            )}
            style={{ height: "100%", maxHeight: "100vh" }}
            aria-hidden={!(notifPanelOpen || isPanelOpen)}
            tabIndex={-1}
          >
            {notifPanelOpen && (
              <NotificationSidePanel onClose={closePanel} />
            )}
            {PanelComponent && isPanelOpen && (
              <PanelComponent onClose={closePanel} />
            )}
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
