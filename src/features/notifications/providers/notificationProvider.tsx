import { useState, useCallback, ReactNode, useMemo } from "react";
import { NotificationContext } from "../context/notificationContext";
import type { NotificationContextValue, Notification, NotificationType } from "../types/notification";

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };

      setNotifications((prev) => [...prev, newNotification]);

      // Auto-remove notification after duration (default 5 seconds)
      if (notification.duration !== 0) {
        const duration = notification.duration ?? 5000;
        setTimeout(() => {
          removeNotification(newNotification.id);
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const createNotificationHelper = useCallback(
    (type: NotificationType) =>
      (title: string, message: string, duration?: number) => {
        addNotification({ type, title, message, duration });
      },
    [addNotification]
  );

  const success = useMemo(() => createNotificationHelper("success"), [createNotificationHelper]);
  const error = useMemo(() => createNotificationHelper("error"), [createNotificationHelper]);
  const warning = useMemo(() => createNotificationHelper("warning"), [createNotificationHelper]);
  const info = useMemo(() => createNotificationHelper("info"), [createNotificationHelper]);

  const value: NotificationContextValue = useMemo(
    () => ({
      notifications,
      addNotification,
      removeNotification,
      clearAllNotifications,
      success,
      error,
      warning,
      info,
    }),
    [notifications, addNotification, removeNotification, clearAllNotifications, success, error, warning, info]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};