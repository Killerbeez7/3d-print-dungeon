import { useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { useScreenSize } from "@/hooks/useScreenSize";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import { useUserNotification } from "../hooks/useUserNotification";
import { formatTimeAbbreviated } from "../utils/formatTimeAbbreviated";
import type { UserNotification } from "../types/userNotification";

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

function getNotificationUserName(notification: UserNotification) {
  return (
    notification.metadata?.followerName ??
    notification.metadata?.likerName ??
    notification.metadata?.commenterName ??
    notification.metadata?.senderName ??
    notification.metadata?.buyerName ??
    notification.metadata?.sellerName ??
    notification.metadata?.downloaderName ??
    notification.metadata?.userName ??
    "User"
  );
}

interface UserNotificationItemProps {
  notification: UserNotification;
  compact?: boolean;
}

export function UserNotificationItem({
  notification,
  compact = false,
}: UserNotificationItemProps) {
  const { deleteNotification } = useUserNotification();
  const { isMobile } = useScreenSize();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteNotification(notification.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const isUnread = notification.status === "unread";

  const containerClasses =
    notification.status === "archived"
      ? "bg-bg-secondary/80 opacity-75"
      : "bg-bg-secondary hover:bg-bg-surface";

  const spacingClasses = compact
    ? "gap-3 rounded-lg p-3"
    : `gap-4 rounded-xl ${isMobile ? "p-3" : "p-4"}`;

  const avatarSize = compact ? "h-10 w-10" : isMobile ? "h-12 w-12" : "h-14 w-14";

  return (
    <div
      className={`relative flex items-center transition-all duration-200 hover:shadow-sm ${spacingClasses} ${containerClasses}`}
    >
      {isUnread && (
        <span
          aria-label="Unread"
          className={`absolute h-3 w-3 animate-pulse rounded-full bg-primary ${
            compact || isMobile ? "right-2 top-2" : "right-3 top-3"
          }`}
        />
      )}

      <img
        src={getAvatarUrlWithCacheBust(getNotificationAvatar(notification))}
        alt={`${getNotificationUserName(notification)}'s profile`}
        className={`${avatarSize} flex-shrink-0 rounded-full border border-br-secondary/30 object-cover`}
      />

      <div className="min-w-0 flex flex-1 flex-col justify-center space-y-0.5">
        <div
          className={`leading-relaxed ${compact ? "text-xs" : "text-sm"} ${
            isUnread ? "text-txt-primary" : "text-txt-secondary"
          }`}
        >
          {getNotificationText(notification)}
        </div>

        <span className="text-xs font-medium text-txt-secondary">
          {formatTimeAbbreviated(notification.createdAt)}
        </span>
      </div>

      {!compact && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            void handleDelete();
          }}
          disabled={isDeleting}
          aria-label="Delete notification"
          title="Delete notification"
          className={`rounded-lg border border-red-500/20 bg-red-500/10 transition-colors duration-200 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${
            isMobile ? "p-1.5" : "p-2"
          }`}
        >
          <FaRegTrashAlt
            aria-hidden="true"
            className={`text-red-500 ${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"}`}
          />
        </button>
      )}
    </div>
  );
}
