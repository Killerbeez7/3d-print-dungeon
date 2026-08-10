import { useState } from "react";

import { FaBell, FaRegTrashAlt } from "react-icons/fa";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserNotification, UserNotificationItem } from "@/features/user/notifications";
import { useScreenSize } from "@/hooks/useScreenSize";

import { ClearAllConfirmModal } from "../components/ClearAllConfirmModal";

export const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const { isMobile } = useScreenSize();

  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    clearAllNotifications,
  } = useUserNotification();

  const [showClearAllModal, setShowClearAllModal] = useState(false);

  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-txt-primary">Access Denied</h1>

          <p className="text-txt-secondary">Please log in to view your notifications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className={`mx-auto max-w-4xl ${isMobile ? "px-3 py-4" : "px-4 py-8"}`}>
        <div className={isMobile ? "mb-4" : "mb-8"}>
          <div
            className={`mb-4 flex ${
              isMobile ? "flex-col space-y-3" : "items-center justify-between"
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className={`rounded-xl bg-primary/10 ${isMobile ? "p-2" : "p-3"}`}>
                  <FaBell
                    aria-hidden="true"
                    className={`text-primary ${isMobile ? "h-6 w-6" : "h-8 w-8"}`}
                  />
                </div>

                <div>
                  <h1
                    className={`font-bold text-txt-primary ${
                      isMobile ? "text-2xl" : "text-3xl"
                    }`}
                  >
                    Notifications
                  </h1>

                  <p className="text-sm text-txt-secondary">
                    Stay updated with your activity
                  </p>
                </div>
              </div>

              {unreadCount > 0 && (
                <div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 font-medium text-white shadow-lg">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 animate-pulse rounded-full bg-white"
                  />

                  <span>{unreadCount} unread</span>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={() => setShowClearAllModal(true)}
                className={`flex items-center space-x-2 rounded-lg bg-red-500 text-white shadow-sm transition-colors hover:bg-red-600 ${
                  isMobile ? "px-3 py-2 text-sm" : "px-4 py-2"
                }`}
              >
                <FaRegTrashAlt aria-hidden="true" className="h-4 w-4" />

                <span className="font-medium">Clear All</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-br-secondary bg-bg-secondary shadow-sm">
          {isLoading ? (
            <div className={`text-center ${isMobile ? "p-8" : "p-16"}`}>
              <div className="mx-auto mb-6 h-16 w-16">
                <div
                  aria-hidden="true"
                  className="h-full w-full animate-spin rounded-full border-4 border-primary/20 border-t-primary"
                />
              </div>

              <h2 className="mb-2 text-xl font-medium text-txt-primary">
                Loading notifications...
              </h2>
            </div>
          ) : error ? (
            <div className={`text-center ${isMobile ? "p-8" : "p-16"}`}>
              <FaBell
                aria-hidden="true"
                className="mx-auto mb-6 h-16 w-16 text-red-500"
              />

              <h2 className="mb-2 text-xl font-medium text-txt-primary">
                Failed to load notifications
              </h2>

              <p className="mx-auto mb-6 max-w-md text-txt-secondary">{error}</p>

              <button
                type="button"
                onClick={() => void fetchNotifications()}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className={`text-center ${isMobile ? "p-8" : "p-16"}`}>
              <FaBell
                aria-hidden="true"
                className="mx-auto mb-6 h-20 w-20 text-txt-tertiary opacity-40"
              />

              <h2
                className={`mb-3 font-semibold text-txt-primary ${
                  isMobile ? "text-xl" : "text-2xl"
                }`}
              >
                No notifications yet
              </h2>

              <p className="text-lg text-txt-secondary">
                Start interacting with the platform to receive notifications.
              </p>
            </div>
          ) : (
            <div className={`space-y-3 ${isMobile ? "p-2" : "p-4"}`}>
              {notifications.map((notification) => (
                <UserNotificationItem
                  key={notification.id}
                  notification={notification}
                  compact={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ClearAllConfirmModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={clearAllNotifications}
        notificationCount={notifications.length}
      />
    </div>
  );
};
