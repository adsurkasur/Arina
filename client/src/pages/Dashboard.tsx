import React from "react";
import { useState } from "react";
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

export default function Dashboard() {
  const { user } = useAuth();
  const isMobile = useMobile();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showRightPanel, setShowRightPanel] = useState(false);

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
      case "help":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-primary">Help & Support</h2>
              <button 
                className="text-gray-500 hover:text-gray-800" 
                onClick={handleCloseToolPanel}
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <p>Need help with Arina? Contact our support team or browse our documentation.</p>
              <p>Email: <a href="mailto:support@arina.ai" className="text-primary underline">support@arina.ai</a></p>
            </div>
          </div>
        );
      default:
        return undefined;
    }
  };

  const handleSetActiveTool = (tool: string) => setActiveTool(tool as string);

  // Only show dashboard if explicitly opened via sidebar
  const showDashboardHome = activeTool === "dashboard";

  // Prevent right panel from opening for dashboard
  const dashboardRightPanel = showDashboardHome ? undefined : renderActiveTool();
  const dashboardShowRightPanel = showDashboardHome ? false : showRightPanel;

  return (
    <MainLayout
      rightPanel={dashboardRightPanel}
      showRightPanel={dashboardShowRightPanel}
      setShowRightPanel={setShowRightPanel}
      setActiveTool={handleSetActiveTool}
    >
      {showDashboardHome ? <DashboardHome /> : <ChatInterface />}
    </MainLayout>
  );
}
