import React from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { PanelContainer } from "@/components/ui/PanelContainer";
import { useMobile } from "@/hooks/use-mobile";

export const NotificationSidePanel: React.FC<{ onClose: () => void; open: boolean }> = ({ onClose, open }) => {
  const { notifications, markAllAsRead } = useNotification();
  const isMobile = useMobile();

  return (
    <PanelContainer onClose={onClose} title="Notifications" fixed={isMobile && open}>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="text-gray-400 text-center mt-8">No notifications yet.</div>
        ) : (
          <>
            <button
              className="mb-4 text-xs text-primary underline"
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li key={n.id} className={`rounded-lg p-4 border shadow-sm ${n.read ? "bg-gray-50" : "bg-green-50 border-green-200"}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-primary">{n.title}</span>
                    <span className="text-xs text-gray-400 ml-2">{new Date(n.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {n.description && <div className="text-xs text-gray-600 mt-1">{n.description}</div>}
                  {!n.read && <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-green-200 text-green-800 rounded">New</span>}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </PanelContainer>
  );
};
