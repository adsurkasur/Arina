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

interface RecommendationsProps {
  onClose: () => void;
}

export default function Recommendations({ onClose }: RecommendationsProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Tool Header */}
      <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-white">
        <h2 className="text-xl font-heading font-semibold text-primary flex items-center gap-2">
          Smart Recommendations
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-5 w-5 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              Get personalized recommendations based on your analysis history
              and current agricultural trends.
            </TooltipContent>
          </Tooltip>
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Tool Content */}
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
    </div>
  );
}
