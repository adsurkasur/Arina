import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { RecommendationsList } from '@/components/recommendations/RecommendationsList';

interface RecommendationsProps {
  onClose: () => void;
}

export default function Recommendations({ onClose }: RecommendationsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Tool Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white">
        <h2 className="text-xl font-heading font-semibold text-primary">Smart Recommendations</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-auto p-6">
        <RecommendationsList />
      </div>
    </div>
  );
}