import React from 'react';
import { RecommendationsList } from './RecommendationsList';
import { PanelContainer } from '@/components/ui/PanelContainer';
import { useTranslation } from 'react-i18next';

interface RecommendationDashboardProps {
  onClose: () => void;
}

export default function RecommendationDashboard({ onClose }: RecommendationDashboardProps) {
  const { t } = useTranslation();
  return (
    <PanelContainer onClose={onClose} title={t('tools.recommendations.title')}>
      <div className="flex-1 overflow-auto p-4">
        <RecommendationsList />
      </div>
    </PanelContainer>
  );
}