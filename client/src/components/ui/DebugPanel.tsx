import React from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useMobile } from "@/hooks/use-mobile";

export const DebugPanel: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { addNotification } = useNotification();
  const isMobile = useMobile();

  const handleNormalToast = () => {
    toast({
      title: "Normal Toast",
      description: "This is a normal toast notification.",
      duration: 4000,
    });
    addNotification({ title: "Normal Toast", description: "This is a normal toast notification.", type: "info" });
  };

  const handleErrorToast = () => {
    toast({
      title: "Error Toast",
      description: "This is an error toast notification.",
      variant: "destructive",
      duration: 4000,
    });
    addNotification({ title: "Error Toast", description: "This is an error toast notification.", type: "error" });
  };

  return (
    <PanelContainer onClose={onClose} title="Debugging">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div>
          <h3 className="font-medium mb-2">Toast notification</h3>
          <div className="flex gap-3">
            <Button onClick={handleNormalToast} variant="default">Show Normal Toast</Button>
            <Button onClick={handleErrorToast} variant="destructive">Show Error Toast</Button>
          </div>
        </div>
        {/* Add more debugging tools here if needed */}
      </div>
    </PanelContainer>
  );
};
