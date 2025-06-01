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

  // Close the active tool panel
  const handleCloseToolPanel = () => {
    setShowRightPanel(false);
    if (isMobile) {
      setActiveTool(null);
    }
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

  // Only show dashboard if explicitly opened via sidebar
  const showDashboardHome = activeTool === "dashboard";

  // Prevent right panel from opening for dashboard
  const dashboardRightPanel = showDashboardHome ? undefined : (currentToolPanel || lastToolPanel);
  const dashboardShowRightPanel = showDashboardHome ? false : showRightPanel;

  return (
    <MainLayout
      rightPanel={dashboardRightPanel}
      showRightPanel={dashboardShowRightPanel}
      setShowRightPanel={setShowRightPanel}
      setActiveTool={setActiveTool}
    >
      {showDashboardHome ? <DashboardHome /> : <ChatInterface />}
    </MainLayout>
  );
}
