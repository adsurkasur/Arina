import React from "react";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useTranslation } from "react-i18next";

interface HelpPanelProps {
  onClose: () => void;
  animatingOut?: boolean;
}

const HelpPanel: React.FC<HelpPanelProps> = ({ onClose, animatingOut }) => {
  const { t } = useTranslation();
  return (
    <PanelContainer
      onClose={onClose}
      title={t("help.title")}
      animatingOut={animatingOut}
    >
      <div className="p-4 space-y-4">
        <p>{t("help.description")}</p>
        <p>
          {t("help.emailLabel")}:
          <a
            href="mailto:support@arina.ai"
            className="text-primary underline"
          >
            support@arina.ai
          </a>
        </p>
      </div>
    </PanelContainer>
  );
};

export default HelpPanel;
