import React from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InfoTooltipProps {
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
}

export function InfoTooltip({ 
  content, 
  side = "top", 
  className = "" 
}: InfoTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center cursor-help text-muted-foreground hover:text-primary transition-colors ${className}`}>
            <Info className="h-4 w-4" />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm p-3">
          <div className="text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}