import React from "react";
import WelcomeBanner from "@/components/chat/WelcomeBanner";
import AnalysisHistory from "@/components/history/AnalysisHistory";
import { Card } from "@/components/ui/card";

// Simple overview mockup for now
function DashboardOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-4">
        <div className="text-lg font-semibold text-primary mb-1">Total Analyses</div>
        <div className="text-2xl font-bold">--</div>
        <div className="text-xs text-muted-foreground">(Coming soon: summary stats)</div>
      </Card>
      <Card className="p-4">
        <div className="text-lg font-semibold text-primary mb-1">Recent Activity</div>
        <div className="text-2xl font-bold">--</div>
        <div className="text-xs text-muted-foreground">(Coming soon: last analysis info)</div>
      </Card>
      <Card className="p-4">
        <div className="text-lg font-semibold text-primary mb-1">AI Insights</div>
        <div className="text-2xl font-bold">--</div>
        <div className="text-xs text-muted-foreground">(Coming soon: smart tips)</div>
      </Card>
    </div>
  );
}

export default function DashboardHome() {
  return (
    <div className="w-full h-full flex flex-col px-0 md:px-0 py-0 overflow-auto bg-white">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col md:flex-row gap-8 p-6 md:p-10">
          <div className="flex-1 flex flex-col gap-6">
            <WelcomeBanner />
            <DashboardOverview />
            <div className="flex-1 flex flex-col">
              <h3 className="text-xl font-semibold text-primary mb-4">Analysis History</h3>
              <div className="flex-1 bg-white rounded-lg shadow p-2 min-h-0">
                <AnalysisHistory onClose={() => {}} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
