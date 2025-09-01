import { useState } from "react";
import { Bell, Check, Trash2, RefreshCw } from "lucide-react";
import { useUserNotification } from "../hooks/useUserNotification";
import { UserNotificationItem } from "./UserNotificationItem";

interface UserNotificationContainerProps {
  className?: string;
}

export const UserNotificationContainer = ({ className = "" }: UserNotificationContainerProps) => {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    error, 
    fetchNotifications, 
    markAllAsRead, 
    clearAllNotifications 
  } = useUserNotification();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications? This action cannot be undone.")) {
      return;
    }
    
    setIsClearingAll(true);
    try {
      await clearAllNotifications();
    } catch (error) {
      console.error("Failed to clear all notifications:", error);
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleRefresh = async () => {
    await fetchNotifications();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  ({unreadCount} unread)
                </span>
              )}
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
                aria-label="Refresh notifications"
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? "animate-spin" : ""}`} />
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllRead}
                  className="p-1 rounded-md hover:bg-blue-100 transition-colors disabled:opacity-50"
                  aria-label="Mark all as read"
                >
                  <Check className="w-4 h-4 text-blue-600" />
                </button>
              )}
              
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearingAll}
                  className="p-1 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                  aria-label="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">
                <p className="mb-2">Failed to load notifications</p>
                <button
                  onClick={handleRefresh}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-lg font-medium mb-1">No notifications yet</p>
                <p className="text-sm">You&apos;ll see notifications about purchases, messages, and more here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <UserNotificationItem
                    key={notification.id}
                    notification={notification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
