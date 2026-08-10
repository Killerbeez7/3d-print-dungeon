import { MdNotifications } from "react-icons/md";
import { useUserNotification } from "../hooks/useUserNotification";

interface NotificationBadgeProps {
  className?: string;
  onClick?: () => void;
}

export const NotificationBadge = ({
  className = "",
  onClick,
}: NotificationBadgeProps) => {
  const { unreadCount } = useUserNotification();

  const notificationLabel =
    unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={notificationLabel}
      className={`relative ${className}`}
    >
      <MdNotifications
        className="h-7 w-7 text-txt-secondary transition-colors duration-200 hover:text-txt-primary"
        aria-hidden="true"
      />

      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
};
