import React, { createContext, useContext, useState, useCallback } from "react";

export type NotificationType = "default" | "error" | "success" | "info";

export interface Notification {
  id: string;
  title: string;
  description?: string;
  type?: NotificationType;
  read?: boolean;
  timestamp: number;
}

interface NotificationContextProps {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAllAsRead: () => void;
  markAsRead: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

export const NOTIFICATION_DURATION = 4000; // ms, unified duration

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [
      { ...notification, id, timestamp: Date.now(), read: false },
      ...prev,
    ]);
    // Optionally auto-mark as read after duration
    setTimeout(() => {
      setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }, NOTIFICATION_DURATION);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, markAllAsRead, markAsRead, unreadCount }}>
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}
