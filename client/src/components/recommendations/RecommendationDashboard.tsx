import React from 'react';
import { RecommendationsList } from './RecommendationsList';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecommendationDashboardProps {
  onClose?: () => void;
}

export default function RecommendationDashboard({ onClose }: RecommendationDashboardProps) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-white">
        <h2 className="text-xl font-heading font-semibold text-primary">
          Smart Recommendations
        </h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <RecommendationsList />
      </div>
    </div>
  );
}