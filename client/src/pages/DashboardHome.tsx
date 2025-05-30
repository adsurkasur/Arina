import React from "react";
import WelcomeBanner from "@/components/chat/WelcomeBanner";
import AnalysisHistory from "@/components/history/AnalysisHistory";
import { Card } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

// Simple overview mockup for now
function DashboardOverview() {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="p-4">
        <div className="text-lg font-semibold text-primary mb-1">{t('dashboard.totalAnalyses')}</div>
        <div className="text-2xl font-bold">--</div>
        <div className="text-xs text-muted-foreground">{t('dashboard.comingSoonSummaryStats')}</div>
      </Card>
      <Card className="p-4">
        <div className="text-lg font-semibold text-primary mb-1">{t('dashboard.recentActivity')}</div>
        <div className="text-2xl font-bold">--</div>
        <div className="text-xs text-muted-foreground">{t('dashboard.comingSoonLastAnalysisInfo')}</div>
      </Card>
      <Card className="p-4">
        <div className="text-lg font-semibold text-primary mb-1">{t('dashboard.aiInsights')}</div>
        <div className="text-2xl font-bold">--</div>
        <div className="text-xs text-muted-foreground">{t('dashboard.comingSoonSmartTips')}</div>
      </Card>
    </div>
  );
}

export default function DashboardHome() {
  const { t } = useTranslation();

  return (
    <div className="w-full h-full flex flex-col px-0 md:px-0 py-0 overflow-auto bg-white">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex-1 flex flex-col md:flex-row gap-8 p-6 md:p-10">
          <div className="flex-1 flex flex-col gap-6">
            <WelcomeBanner />
            <DashboardOverview />
          </div>
        </div>
      </div>
    </div>
  );
}
