import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMobile } from "@/hooks/use-mobile";
import { MainLayout } from "@/components/layout/MainLayout";
import ChatInterface from "@/components/chat/ChatInterface";
import BusinessFeasibility from "@/components/tools/BusinessFeasibility";
import DemandForecasting from "@/components/tools/DemandForecasting";
import OptimizationAnalysis from "@/components/tools/OptimizationAnalysis";
import RecommendationDashboard from "@/components/recommendations/RecommendationDashboard";
import UserProfile from "@/components/profile/UserProfile";

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
      case "userProfile":
        return <UserProfile onClose={handleCloseToolPanel} />;
      case "businessFeasibility":
        return <BusinessFeasibility onClose={handleCloseToolPanel} />;
      case "demandForecasting":
        return <DemandForecasting onClose={handleCloseToolPanel} />;
      case "optimizationAnalysis":
        return <OptimizationAnalysis onClose={handleCloseToolPanel} />;
      case "recommendations":
        return <RecommendationDashboard />;
      case "settings":
        return <UserProfile onClose={handleCloseToolPanel} />;
      case "help":
        // Placeholder for help panel
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
