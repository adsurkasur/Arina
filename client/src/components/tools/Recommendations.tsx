import React from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { RecommendationsList } from "@/components/recommendations/RecommendationsList";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { PanelContainer } from "@/components/ui/PanelContainer";

interface RecommendationsProps {
  onClose: () => void;
}

export default function Recommendations({ onClose }: RecommendationsProps) {
  return (
    <PanelContainer onClose={onClose} title="Smart Recommendations">
      <div className="flex-1 overflow-auto p-6">
        {/* Recommendations List Header */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-primary">
            Recommendations List
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              View a list of actionable recommendations tailored to your
              business needs.
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Recommendations List */}
        <RecommendationsList />

        {/* Additional Insights Section */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-primary flex items-center gap-2">
            Additional Insights
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                Explore additional insights and trends to enhance your
                decision-making process.
              </TooltipContent>
            </Tooltip>
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            These insights are generated based on the latest data and trends in
            the agricultural sector.
          </p>
        </div>
      </div>
    </PanelContainer>
  );
}
