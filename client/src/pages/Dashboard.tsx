import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { MainLayout } from "@/components/layout/MainLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import BusinessFeasibility from "@/components/tools/BusinessFeasibility";
import DemandForecasting from "@/components/tools/DemandForecasting";
import OptimizationAnalysis from "@/components/tools/OptimizationAnalysis";
import RecommendationDashboard from "@/components/recommendations/RecommendationDashboard";
import AnalysisHistory from "@/components/history/AnalysisHistory";
import UserProfile from "@/components/profile/UserProfile";
import SettingsPanel from "@/components/profile/SettingsPanel";
import DashboardHome from "./DashboardHome";
import { DebugPanel } from "@/components/ui/DebugPanel";
import HelpPanel from "@/components/ui/HelpPanel";

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [lastToolPanel, setLastToolPanel] = useState<JSX.Element | undefined>(undefined);
  // New: Track main view separately from right panel/tool
  const [mainView, setMainView] = useState<'dashboard' | 'chat'>("dashboard");

  // Close the active tool panel
  const handleCloseToolPanel = () => {
    setShowRightPanel(false);
    setActiveTool(null);
  };

  // Set the main view (dashboard or chat) independently
  const handleSetMainView = (view: 'dashboard' | 'chat') => {
    setMainView(view);
  };

  // Set the right panel/tool independently
  const handleSetActiveTool = (tool: string | null) => {
    // Only update the right panel, do not affect mainView
    setActiveTool(tool);
    setShowRightPanel(!!tool);
  };

  // Render the active tool component
  const renderActiveTool = () => {
    if (!activeTool) return undefined;

    switch (activeTool) {
      case "userProfile":
        return <UserProfile onClose={handleCloseToolPanel} />;
      case "businessFeasibility":
        return <BusinessFeasibility onClose={handleCloseToolPanel} />;
      case "demandForecasting":
        return <DemandForecasting onClose={handleCloseToolPanel} />;
      case "optimizationAnalysis":
        return <OptimizationAnalysis onClose={handleCloseToolPanel} />;
      case "recommendations":
        return <RecommendationDashboard onClose={handleCloseToolPanel} />;
      case "analysisHistory":
        return <AnalysisHistory onClose={handleCloseToolPanel} />;
      case "settings":
        return <SettingsPanel onClose={handleCloseToolPanel} />;
      case "debug":
        return <DebugPanel open={true} onClose={handleCloseToolPanel} />;
      case "help":
        return <HelpPanel onClose={handleCloseToolPanel} />;
      default:
        return undefined;
    }
  };

  // Track the last tool panel for animation out
  const currentToolPanel = renderActiveTool();
  // Fix: useEffect to update lastToolPanel
  useEffect(() => {
    if (currentToolPanel && currentToolPanel !== lastToolPanel) {
      setLastToolPanel(currentToolPanel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentToolPanel]);

  // Determine if dashboard home should be shown
  const showDashboardHome = activeTool === "dashboard";

  // Only show a right panel if a tool is selected (not null)
  const isToolPanel = !!activeTool;
  const dashboardRightPanel = showRightPanel && isToolPanel ? (currentToolPanel || lastToolPanel) : undefined;
  const dashboardShowRightPanel = showRightPanel && isToolPanel;

  // Main view logic: show DashboardHome or ChatInterface
  let mainViewComponent: JSX.Element = <DashboardHome />;
  if (mainView === "chat") {
    mainViewComponent = <ChatInterface />;
  }

  return (
    <MainLayout
      rightPanel={dashboardRightPanel}
      showRightPanel={dashboardShowRightPanel}
      setShowRightPanel={setShowRightPanel}
      setActiveTool={(tool) => handleSetActiveTool(tool)}
      setMainView={handleSetMainView}
    >
      {mainViewComponent}
    </MainLayout>
  );
}
