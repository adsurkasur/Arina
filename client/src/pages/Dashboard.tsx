import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { MainLayout } from "@/components/layout/MainLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import BusinessFeasibility from "@/components/tools/BusinessFeasibility";
import DemandForecasting from "@/components/tools/DemandForecasting";
import OptimizationAnalysis from "@/components/tools/OptimizationAnalysis";
import RecommendationDashboard from "@/components/recommendations/RecommendationDashboard";

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
    if (!activeTool) return null;

    switch (activeTool) {
      case "businessFeasibility":
        return <BusinessFeasibility onClose={handleCloseToolPanel} />;
      case "demandForecasting":
        return <DemandForecasting onClose={handleCloseToolPanel} />;
      case "optimizationAnalysis":
        return <OptimizationAnalysis onClose={handleCloseToolPanel} />;
      case "recommendations":
        return <RecommendationDashboard />;
      default:
        return null;
    }
  };

  return (
    <MainLayout
      rightPanel={renderActiveTool()}
      showRightPanel={showRightPanel}
      setShowRightPanel={setShowRightPanel}
      setActiveTool={setActiveTool}
    >
      <ChatInterface />
    </MainLayout>
  );
}
