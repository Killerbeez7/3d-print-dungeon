import { useState, useCallback, ReactNode, useEffect } from "react";
import { useAuth } from "../../../auth/hooks/useAuth";
import { UserNotificationContext } from "../context/userNotificationContext";
import { UserNotificationService } from "../services/userNotificationService";
import type { UserNotificationContextValue, UserNotification } from "../types/userNotification";

export const UserNotificationProvider = ({ children }: { children: ReactNode }) => {
  const { authUser } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!authUser?.uid) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedNotifications = await UserNotificationService.fetchUserNotifications(authUser.uid);
      setNotifications(fetchedNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.uid]);

  const fetchUnreadCount = useCallback(async () => {
    if (!authUser?.uid) return;
    
    try {
      const count = await UserNotificationService.getUnreadCount(authUser.uid);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, [authUser?.uid]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (authUser?.uid) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [authUser?.uid, fetchNotifications, fetchUnreadCount]);

  const markAsRead = useCallback(async (id: string) => {
    if (!authUser?.uid) return;
    
    try {
      await UserNotificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, status: "read", readAt: new Date() }
            : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark notification as read");
    }
  }, [authUser?.uid]);

  const markAllAsRead = useCallback(async () => {
    if (!authUser?.uid) return;
    
    try {
      await UserNotificationService.markAllAsRead(authUser.uid);
      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          status: "read" as const,
          readAt: new Date()
        }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark all notifications as read");
    }
  }, [authUser?.uid]);

  const deleteNotification = useCallback(async (id: string) => {
    if (!authUser?.uid) return;
    
    try {
      await UserNotificationService.deleteNotification(id);
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification?.status === "unread") {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete notification");
    }
  }, [authUser?.uid, notifications]);

  const clearAllNotifications = useCallback(async () => {
    if (!authUser?.uid) return;
    
    try {
      await UserNotificationService.clearAllNotifications(authUser.uid);
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to clear all notifications");
    }
  }, [authUser?.uid]);

  const addNotification = useCallback(async (data: Omit<UserNotification, "id" | "createdAt" | "status">) => {
    if (!authUser?.uid) return;
    
    try {
      const notificationId = await UserNotificationService.createNotification({
        ...data,
        userId: authUser.uid
      });
      
      const newNotification: UserNotification = {
        id: notificationId,
        ...data,
        userId: authUser.uid,
        status: "unread",
        createdAt: new Date(),
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create notification");
    }
  }, [authUser?.uid]);

  const value: UserNotificationContextValue = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification,
  };

  return (
    <UserNotificationContext.Provider value={value}>
      {children}
    </UserNotificationContext.Provider>
  );
};
