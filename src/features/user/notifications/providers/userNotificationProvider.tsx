import { useState, useEffect, useCallback, useMemo, type ReactNode } from "react";

import { useAuth } from "../../../auth/hooks/useAuth";

import { UserNotificationContext } from "../context/userNotificationContext";
import { UserNotificationService } from "../services/userNotificationService";
import type {
  UserNotification,
  UserNotificationContextValue,
  CreateUserNotificationInput,
} from "../types/userNotification";

export const UserNotificationProvider = ({ children }: { children: ReactNode }) => {
  const { authUser } = useAuth();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!authUser?.uid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedNotifications = await UserNotificationService.fetchUserNotifications(
        authUser.uid
      );

      setNotifications(fetchedNotifications);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.uid]);

  const fetchUnreadCount = useCallback(async () => {
    if (!authUser?.uid) {
      return;
    }

    try {
      const count = await UserNotificationService.getUnreadCount(authUser.uid);

      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [authUser?.uid]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (!authUser?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    void fetchNotifications();
    void fetchUnreadCount();
  }, [authUser?.uid, fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(
    async (id: string) => {
      if (!authUser?.uid) {
        return;
      }

      const notification = notifications.find((item) => item.id === id);

      if (notification?.status === "read") {
        return;
      }

      try {
        await UserNotificationService.markAsRead(id);

        setNotifications((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: "read",
                  readAt: new Date(),
                }
              : item
          )
        );

        if (notification?.status === "unread") {
          setUnreadCount((current) => Math.max(0, current - 1));
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to mark notification as read"
        );
      }
    },
    [authUser?.uid, notifications]
  );

  const deleteNotification = useCallback(
    async (id: string) => {
      if (!authUser?.uid) {
        return;
      }

      const notification = notifications.find((item) => item.id === id);

      try {
        await UserNotificationService.deleteNotification(id);

        setNotifications((current) => current.filter((item) => item.id !== id));

        if (notification?.status === "unread") {
          setUnreadCount((current) => Math.max(0, current - 1));
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to delete notification"
        );
      }
    },
    [authUser?.uid, notifications]
  );

  const clearAllNotifications = useCallback(async () => {
    if (!authUser?.uid) {
      return;
    }

    try {
      await UserNotificationService.clearAllNotifications(authUser.uid);

      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to clear all notifications"
      );

      throw error;
    }
  }, [authUser?.uid]);

  const addNotification = useCallback(
    async (data: CreateUserNotificationInput) => {
      if (!authUser?.uid) {
        return;
      }

      try {
        const notificationId = await UserNotificationService.createNotification({
          ...data,
          userId: authUser.uid,
        });

        const newNotification: UserNotification = {
          ...data,
          id: notificationId,
          userId: authUser.uid,
          status: "unread",
          createdAt: new Date(),
        };

        setNotifications((current) => [newNotification, ...current]);

        setUnreadCount((current) => current + 1);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to create notification"
        );
      }
    },
    [authUser?.uid]
  );

  const value = useMemo<UserNotificationContextValue>(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      addNotification,
      fetchNotifications,
      deleteNotification,
      clearAllNotifications,
    }),
    [
      notifications,
      unreadCount,
      isLoading,
      error,
      markAsRead,
      addNotification,
      fetchNotifications,
      deleteNotification,
      clearAllNotifications,
    ]
  );

  return (
    <UserNotificationContext.Provider value={value}>
      {children}
    </UserNotificationContext.Provider>
  );
};
