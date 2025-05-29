import React from 'react';
import { RecommendationsList } from './RecommendationsList';
import { PanelContainer } from '@/components/ui/PanelContainer';

interface RecommendationDashboardProps {
  onClose?: () => void;
}

export default function RecommendationDashboard({ onClose }: RecommendationDashboardProps) {
  return (
    <PanelContainer onClose={onClose} title="Smart Recommendations">
      <div className="flex-1 overflow-auto p-4">
        <RecommendationsList />
      </div>
    </PanelContainer>
  );
}