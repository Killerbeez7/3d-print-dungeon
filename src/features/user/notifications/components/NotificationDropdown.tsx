import { useState, useRef, type MouseEvent, type RefObject } from "react";
import { useNavigate } from "react-router-dom";

import { Settings } from "lucide-react";
import { Bell } from "lucide-react";

import { useScreenSize } from "@/hooks/useScreenSize";
import { useClickOutside } from "@/hooks/useClickOutside";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import { useUserNotification } from "../hooks/useUserNotification";
import { formatTimeAbbreviated } from "../utils/formatTimeAbbreviated";
import type { UserNotification } from "../types/userNotification";

function getNotificationPath(notification: UserNotification): string | null {
  if (!notification.relatedId) {
    return null;
  }

  switch (notification.type) {
    case "follow":
      return `/user/${notification.relatedId}`;

    case "message":
      return `/messages/${notification.relatedId}`;

    case "like":
    case "comment":
    case "purchase":
    case "sale":
    case "download":
      return `/model/${notification.relatedId}`;

    default:
      return null;
  }
}

function getNotificationText(notification: UserNotification) {
  switch (notification.type) {
    case "like": {
      const likerName =
        notification.metadata?.likerName ?? notification.metadata?.userName ?? "Someone";

      const modelName = notification.metadata?.modelName ?? "your model";

      return (
        <span>
          <span className="font-semibold text-txt-primary">{likerName}</span>
          <span className="text-txt-secondary"> liked your model &ldquo;</span>
          <span className="font-medium text-txt-primary">{modelName}</span>
          <span className="text-txt-secondary">&rdquo;</span>
        </span>
      );
    }

    case "follow": {
      const followerName =
        notification.metadata?.followerName ??
        notification.metadata?.userName ??
        "Someone";

      return (
        <span>
          <span className="font-semibold text-txt-primary">{followerName}</span>
          <span className="text-txt-secondary"> started following you</span>
        </span>
      );
    }

    case "comment": {
      const commenterName =
        notification.metadata?.commenterName ??
        notification.metadata?.userName ??
        "Someone";

      const modelName = notification.metadata?.modelName ?? "your model";

      return (
        <span>
          <span className="font-semibold text-txt-primary">{commenterName}</span>
          <span className="text-txt-secondary"> commented on your model &ldquo;</span>
          <span className="font-medium text-txt-primary">{modelName}</span>
          <span className="text-txt-secondary">&rdquo;</span>
        </span>
      );
    }

    case "message": {
      const senderName =
        notification.metadata?.senderName ?? notification.metadata?.userName ?? "Someone";

      return (
        <span>
          <span className="font-semibold text-txt-primary">{senderName}</span>
          <span className="text-txt-secondary"> sent you a message</span>
        </span>
      );
    }

    case "purchase": {
      const buyerName =
        notification.metadata?.buyerName ?? notification.metadata?.userName ?? "Someone";

      const modelName = notification.metadata?.modelName ?? "your model";

      return (
        <span>
          <span className="font-semibold text-txt-primary">{buyerName}</span>
          <span className="text-txt-secondary"> purchased your model &ldquo;</span>
          <span className="font-medium text-txt-primary">{modelName}</span>
          <span className="text-txt-secondary">&rdquo;</span>
        </span>
      );
    }

    case "sale": {
      const buyerName =
        notification.metadata?.buyerName ?? notification.metadata?.userName ?? "Someone";

      const modelName = notification.metadata?.modelName ?? "your model";

      return (
        <span>
          <span className="text-txt-secondary">Your model &ldquo;</span>
          <span className="font-medium text-txt-primary">{modelName}</span>
          <span className="text-txt-secondary">&rdquo; was purchased by </span>
          <span className="font-semibold text-txt-primary">{buyerName}</span>
        </span>
      );
    }

    case "download": {
      const downloaderName =
        notification.metadata?.downloaderName ??
        notification.metadata?.userName ??
        "Someone";

      const modelName = notification.metadata?.modelName ?? "your model";

      return (
        <span>
          <span className="font-semibold text-txt-primary">{downloaderName}</span>
          <span className="text-txt-secondary"> downloaded your model &ldquo;</span>
          <span className="font-medium text-txt-primary">{modelName}</span>
          <span className="text-txt-secondary">&rdquo;</span>
        </span>
      );
    }

    default:
      return (
        <span className="text-txt-secondary">
          {notification.message ?? "New notification"}
        </span>
      );
  }
}

function getNotificationAvatar(notification: UserNotification) {
  return (
    notification.metadata?.userAvatar ??
    notification.metadata?.likerAvatar ??
    notification.metadata?.followerAvatar ??
    notification.metadata?.commenterAvatar ??
    notification.metadata?.senderAvatar ??
    notification.metadata?.buyerAvatar ??
    notification.metadata?.sellerAvatar ??
    notification.metadata?.downloaderAvatar ??
    notification.metadata?.photoURL
  );
}

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className = "" }: NotificationDropdownProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead } = useUserNotification();
  const { isMobile } = useScreenSize();

  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef as RefObject<HTMLElement>, () => setIsOpen(false));

  const recentNotifications = notifications.slice(0, 5);

  const handleNotificationClick = async (notification: UserNotification) => {
    if (notification.status === "unread") {
      await markAsRead(notification.id);
    }

    const path = getNotificationPath(notification);

    if (path) {
      navigate(path);
    }

    setIsOpen(false);
  };

  const handleOpenNotificationsCenter = () => {
    setIsOpen(false);
    navigate("/notifications");
  };

  const handleViewAll = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setShowAllNotifications((current) => !current);
  };

  const handleBellClick = () => {
    if (isMobile) {
      navigate("/notifications");
      return;
    }

    setIsOpen((current) => !current);
  };

  const visibleNotifications = showAllNotifications ? notifications : recentNotifications;

  return (
    <div
      ref={dropdownRef}
      className={`relative flex h-9 w-9 items-center justify-center ${className}`}
    >
      <button
        type="button"
        onClick={handleBellClick}
        aria-label={
          unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
        }
        aria-expanded={isMobile ? undefined : isOpen}
        aria-controls={isMobile ? undefined : "notification-dropdown"}
        className="relative inline-flex size-10 items-center justify-center rounded-lg text-txt-secondary transition-colors duration-200 hover:bg-muted hover:text-txt-primary"
      >
        <Bell aria-hidden="true" className="size-5" />

        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ember-fill px-1 font-mono text-[0.625rem] font-semibold text-ember-on"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && !isMobile && (
        <div
          id="notification-dropdown"
          role="region"
          aria-label="Notifications"
          className="absolute right-0 top-full z-50 mt-3 w-80 overflow-hidden rounded-xl border border-br-secondary bg-surface-elevated shadow-2xl shadow-black/40"
        >
          <div className="border-b border-br-secondary/30 p-3">
            <button
              type="button"
              onClick={handleOpenNotificationsCenter}
              className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-txt-secondary transition-colors hover:bg-surface-card hover:text-txt-primary"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
              <span>Notifications Center</span>
            </button>
          </div>

          <div
            className={`custom-scrollbar overflow-y-auto p-2 transition-all duration-300 ${
              showAllNotifications ? "max-h-[32rem]" : "max-h-80"
            }`}
          >
            {notifications.length === 0 ? (
              <div className="p-4 text-center">
                <Bell aria-hidden="true" className="mx-auto mb-2 size-8 text-txt-muted" />

                <p className="text-sm text-txt-secondary">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-0.5">
                {visibleNotifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className="flex w-full items-center gap-3 rounded-lg border border-transparent p-2 text-left transition-all duration-200 hover:border-br-primary/30 hover:bg-surface-card/50"
                  >
                    <img
                      src={getAvatarUrlWithCacheBust(getNotificationAvatar(notification))}
                      alt=""
                      className="h-12 w-12 flex-shrink-0 rounded-full border border-br-secondary/30 object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="text-sm leading-tight text-txt-primary">
                        {getNotificationText(notification)}
                      </div>

                      <p className="mt-1 text-xs leading-tight text-txt-muted">
                        {formatTimeAbbreviated(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 5 && (
            <div className="border-t border-br-secondary/30 p-3">
              <button
                type="button"
                onClick={handleViewAll}
                className="flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm text-txt-secondary transition-colors hover:bg-surface-card hover:text-txt-primary"
              >
                {showAllNotifications ? "Show Less" : "View All"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
