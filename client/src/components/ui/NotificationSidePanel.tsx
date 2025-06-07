import React from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useMobile } from "@/hooks/use-mobile";
import { useTranslation } from 'react-i18next';

export const NotificationSidePanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { notifications, markAllAsRead } = useNotification();
  const isMobile = useMobile();
  const { t } = useTranslation();

  return (
    <PanelContainer onClose={onClose} title={t("notifications.title")} fixed={isMobile}>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">{t("notifications.empty")}</div>
        ) : (
          <>
            <button
              className="mb-4 text-xs text-primary underline"
              onClick={markAllAsRead}
            >
              {t("notifications.markAllAsRead")}
            </button>
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className={`rounded-lg p-4 border ${n.read ? "bg-gray-50" : "bg-green-50 border-green-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-primary">{t(n.title)}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {n.description && <div className="text-xs text-gray-600 mt-1">{t(n.description)}</div>}
                  {!n.read && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded">{t('notifications.new')}</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </PanelContainer>
  );
};
