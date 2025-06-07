import React from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useMobile } from "@/hooks/use-mobile";
import { useTranslation } from 'react-i18next';

export const DebugPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const isMobile = useMobile();
  const { t } = useTranslation();
  const { toast } = useToast();

  const handleNormalToast = () => {
    toast({
      title: t('toast.normalTitle'),
      description: t('toast.normalDescription'),
      duration: 4000,
    });
  };

  const handleErrorToast = () => {
    toast({
      title: t('toast.errorTitle'),
      description: t('toast.errorDescription'),
      variant: "destructive",
      duration: 4000,
    });
  };

  return (
    <PanelContainer onClose={onClose} title={t('debugPanel.title')}>
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        <div>
          <h3 className="font-medium mb-2">{t('debugPanel.toastNotification')}</h3>
          <div className="flex gap-3">
            <Button onClick={handleNormalToast} variant="default">{t('debugPanel.showNormalToast')}</Button>
            <Button onClick={handleErrorToast} variant="destructive">{t('debugPanel.showErrorToast')}</Button>
          </div>
        </div>
        {/* Add more debugging tools here if needed */}
      </div>
    </PanelContainer>
  );
};
