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
import { useTranslation } from "react-i18next";

interface RecommendationsProps {
  onClose: () => void;
  open?: boolean;
}

export default function Recommendations({ onClose, open }: RecommendationsProps) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <PanelContainer onClose={onClose} title={t("tools.recommendations.title")}>
      <div className="flex-1 overflow-auto p-6">
        {/* Recommendations List Header */}
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-primary">
            {t("tools.recommendations.listTitle")}
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]">
              {t("tools.recommendations.listTooltip")}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Recommendations List */}
        <RecommendationsList />

        {/* Additional Insights Section */}
        <div className="mt-6">
          <h4 className="text-md font-medium text-primary flex items-center gap-2">
            {t("tools.recommendations.additionalInsights")}
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-gray-500" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                {t("tools.recommendations.additionalInsightsTooltip")}
              </TooltipContent>
            </Tooltip>
          </h4>
          <p className="text-sm text-gray-600 mt-2">
            {t("tools.recommendations.additionalInsightsDesc")}
          </p>
        </div>
      </div>
    </PanelContainer>
  );
}
