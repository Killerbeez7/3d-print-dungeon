import { useState } from "react";
import { Bell, Download, Heart, Mail, MessageSquare, ShoppingBag, Trash2, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { STATIC_ASSETS } from "@/config/assetsConfig";
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

const typeIcons: Partial<Record<UserNotification["type"], { icon: LucideIcon; tone: string }>> = {
  like: { icon: Heart, tone: "bg-ember-fill text-ember-on" },
  follow: { icon: UserPlus, tone: "bg-btn-primary text-btn-primary-text" },
  comment: { icon: MessageSquare, tone: "bg-btn-primary text-btn-primary-text" },
  message: { icon: Mail, tone: "bg-btn-primary text-btn-primary-text" },
  purchase: { icon: ShoppingBag, tone: "bg-success text-page" },
  sale: { icon: ShoppingBag, tone: "bg-success text-page" },
  download: { icon: Download, tone: "bg-btn-primary text-btn-primary-text" },
};

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
}

export function UserNotificationItem({ notification }: UserNotificationItemProps) {
  const { deleteNotification } = useUserNotification();
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
  const { icon: TypeIcon, tone } = typeIcons[notification.type] ?? {
    icon: Bell,
    tone: "bg-muted text-txt-secondary",
  };

  return (
    <li
      className={`group relative flex items-center gap-4 px-4 py-4 transition-colors hover:bg-muted/40 sm:px-5 ${
        notification.status === "archived" ? "opacity-70" : ""
      }`}
    >
      {/* Unread: accent bar on the left edge */}
      {isUnread && <span className="absolute inset-y-3 left-0 w-0.5 bg-accent" aria-hidden="true" />}

      <span className="relative shrink-0">
        <img
          src={getAvatarUrlWithCacheBust(getNotificationAvatar(notification))}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="chamfer size-11 bg-muted object-cover [--cut:9px]"
          onError={(event) => {
            const image = event.currentTarget;
            if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) image.src = STATIC_ASSETS.DEFAULT_AVATAR;
          }}
        />
        <span
          className={`absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full ring-2 ring-surface-card ${tone}`}
          aria-hidden="true"
        >
          <TypeIcon className="size-3" />
        </span>
      </span>

      <div className="min-w-0 flex-1">
        <p className={`text-sm leading-relaxed ${isUnread ? "" : "opacity-80"}`}>
          <span className="sr-only">{getNotificationUserName(notification)}: </span>
          {getNotificationText(notification)}
        </p>
        <p className="mt-0.5 flex items-center gap-2 font-mono text-xs text-txt-muted">
          {formatTimeAbbreviated(notification.createdAt)}
          {isUnread && <span className="text-accent">· new</span>}
        </p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void handleDelete();
        }}
        disabled={isDeleting}
        aria-label="Delete notification"
        title="Delete notification"
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-txt-muted transition-[color,background-color,opacity] hover:bg-error/10 hover:text-error focus-visible:opacity-100 disabled:opacity-50 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </li>
  );
}
