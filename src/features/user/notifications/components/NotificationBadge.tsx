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

    return (
        <button
            onClick={onClick}
            className={`relative ${className}`}
            aria-label="Notifications"
        >
            <MdNotifications className="h-7 w-7 text-txt-secondary hover:text-txt-primary transition-colors duration-200" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}
        </button>
    );
};
