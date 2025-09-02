import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";
import type { UserNotification } from "../types/userNotification";
import { useUserNotification } from "../hooks/useUserNotification";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";
import { useScreenSize } from "@/hooks/useScreenSize";

// Custom time formatter to use abbreviated format
const formatTimeAbbreviated = (date: Date) => {
    const distance = formatDistanceToNow(date, { addSuffix: false });
    
    if (distance.includes('minute')) {
        const minutes = distance.match(/(\d+)/)?.[1] || '0';
        return `${minutes} min`;
    } else if (distance.includes('hour')) {
        const hours = distance.match(/(\d+)/)?.[1] || '0';
        return `${hours} h`;
    } else if (distance.includes('day')) {
        const days = distance.match(/(\d+)/)?.[1] || '0';
        return `${days} d`;
    } else if (distance.includes('week')) {
        const weeks = distance.match(/(\d+)/)?.[1] || '0';
        return `${weeks} w`;
    } else if (distance.includes('month')) {
        const months = distance.match(/(\d+)/)?.[1] || '0';
        return `${months} m`;
    } else if (distance.includes('year')) {
        const years = distance.match(/(\d+)/)?.[1] || '0';
        return `${years} y`;
    }
    
    return distance;
};

interface UserNotificationItemProps {
    notification: UserNotification;
    compact?: boolean;
}

const getNotificationStyles = (status: UserNotification["status"], compact: boolean, isMobile: boolean) => {
    const baseStyles = compact
        ? "relative flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:shadow-sm"
        : `relative flex items-center gap-4 ${isMobile ? 'p-3' : 'p-4'} rounded-xl transition-all duration-300 hover:shadow-lg`;

    switch (status) {
        case "unread":
            return `${baseStyles} bg-bg-secondary hover:bg-bg-surface`;
        case "read":
            return `${baseStyles} bg-bg-secondary hover:bg-bg-surface`;
        case "archived":
            return `${baseStyles} bg-bg-secondary/80 opacity-75`;
        default:
            return `${baseStyles} bg-bg-secondary`;
    }
};

const getStatusIndicator = (status: UserNotification["status"], compact: boolean, isMobile: boolean) => {
    if (status === "unread") {
        return (
            <div className={`absolute ${compact ? "top-2 right-2" : (isMobile ? "top-2 right-2" : "top-3 right-3")}`}>
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
            </div>
        );
    }
    return null;
};

const getNotificationText = (notification: UserNotification) => {
    switch (notification.type) {
        case "like":
            const likerName = notification.metadata?.likerName || notification.metadata?.userName || "Someone";
            const modelName = notification.metadata?.modelName || "your model";
            return (
                <span>
                    <span className="font-semibold text-txt-primary">{likerName}</span>
                    <span className="text-txt-secondary"> liked your model &ldquo;</span>
                    <span className="font-medium text-txt-primary">{modelName}</span>
                    <span className="text-txt-secondary">&rdquo;</span>
                </span>
            );
        case "follow":
            const followerName = notification.metadata?.followerName || notification.metadata?.userName || "Someone";
            return (
                <span>
                    <span className="font-semibold text-txt-primary">{followerName}</span>
                    <span className="text-txt-secondary"> started following you</span>
                </span>
            );
        case "comment":
            const commenterName = notification.metadata?.commenterName || notification.metadata?.userName || "Someone";
            const commentModelName = notification.metadata?.modelName || "your model";
            return (
                <span>
                    <span className="font-semibold text-txt-primary">{commenterName}</span>
                    <span className="text-txt-secondary"> commented on your model &ldquo;</span>
                    <span className="font-medium text-txt-primary">{commentModelName}</span>
                    <span className="text-txt-secondary">&rdquo;</span>
                </span>
            );
        case "message":
            const senderName = notification.metadata?.senderName || notification.metadata?.userName || "Someone";
            return (
                <span>
                    <span className="font-semibold text-txt-primary">{senderName}</span>
                    <span className="text-txt-secondary"> sent you a message</span>
                </span>
            );
        case "purchase":
            const buyerName = notification.metadata?.buyerName || notification.metadata?.userName || "Someone";
            const purchaseModelName = notification.metadata?.modelName || "your model";
            return (
                <span>
                    <span className="font-semibold text-txt-primary">{buyerName}</span>
                    <span className="text-txt-secondary"> purchased your model &ldquo;</span>
                    <span className="font-medium text-txt-primary">{purchaseModelName}</span>
                    <span className="text-txt-secondary">&rdquo;</span>
                </span>
            );
        case "sale":
            const sellerName = notification.metadata?.sellerName || notification.metadata?.userName || "Someone";
            const saleModelName = notification.metadata?.modelName || "your model";
            return (
                <span>
                    <span className="text-txt-secondary">Your model &ldquo;</span>
                    <span className="font-medium text-txt-primary">{saleModelName}</span>
                    <span className="text-txt-secondary">&rdquo; was purchased by </span>
                    <span className="font-semibold text-txt-primary">{sellerName}</span>
                </span>
            );
        case "download":
            const downloaderName = notification.metadata?.downloaderName || notification.metadata?.userName || "Someone";
            const downloadModelName = notification.metadata?.modelName || "your model";
            return (
                <span>
                    <span className="font-semibold text-txt-primary">{downloaderName}</span>
                    <span className="text-txt-secondary"> downloaded your model &ldquo;</span>
                    <span className="font-medium text-txt-primary">{downloadModelName}</span>
                    <span className="text-txt-secondary">&rdquo;</span>
                </span>
            );
        default:
            return <span className="text-txt-secondary">{notification.message || "New notification"}</span>;
    }
};

export const UserNotificationItem = ({
    notification,
    compact = false,
}: UserNotificationItemProps) => {
    const { deleteNotification } = useUserNotification();
    const [isDeleting, setIsDeleting] = useState(false);
    const { isMobile } = useScreenSize();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deleteNotification(notification.id);
        } catch (error) {
            console.error("Failed to delete notification:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className={getNotificationStyles(notification.status, compact, isMobile)}>
            {getStatusIndicator(notification.status, compact, isMobile)}

            {/* User Avatar */}
            <div className="flex-shrink-0">
                <img
                    src={getAvatarUrlWithCacheBust(
                        notification.metadata?.userAvatar || 
                        notification.metadata?.likerAvatar || 
                        notification.metadata?.followerAvatar || 
                        notification.metadata?.commenterAvatar || 
                        notification.metadata?.senderAvatar || 
                        notification.metadata?.buyerAvatar || 
                        notification.metadata?.sellerAvatar || 
                        notification.metadata?.downloaderAvatar ||
                        notification.metadata?.photoURL
                    )}
                    alt={`${notification.metadata?.followerName || notification.metadata?.likerName || notification.metadata?.userName || "User"}'s profile`}
                    className={`${
                        compact ? "w-10 h-10" : (isMobile ? "w-12 h-12" : "w-14 h-14")
                    } rounded-full object-cover border border-br-secondary/30`}
                />
            </div>

            {/* Content */}
             <div className="flex-1 min-w-0 space-y-0.5 flex flex-col justify-center">
                 {/* Title removed - only showing notification text */}

                 <div
                     className={`${compact ? 'text-xs' : (isMobile ? 'text-sm' : 'text-sm')} leading-relaxed ${
                         notification.status === "unread"
                             ? "text-txt-primary"
                             : "text-txt-secondary"
                     }`}
                 >
                     {getNotificationText(notification)}
                 </div>

                 {/* Time Ago */}
                 <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-txt-secondary font-medium`}>
                     {formatTimeAbbreviated(notification.createdAt)}
                 </span>
            </div>

            {/* Actions */}
            {!compact && (
                <div className="flex flex-col gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDelete();
                        }}
                        disabled={isDeleting}
                        className={`${isMobile ? 'p-1.5' : 'p-2'} rounded-lg hover:bg-red-500/20 transition-colors duration-200 group/btn bg-red-500/10 border border-red-500/20 disabled:opacity-50`}
                        aria-label="Delete notification"
                        title="Delete notification"
                    >
                        <Trash2 className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-red-500 group-hover/btn:scale-110 transition-transform`} />
                    </button>
                </div>
            )}
        </div>
    );
};
