import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useUserNotification } from "../hooks/useUserNotification";
import { MdNotifications } from "react-icons/md";
import { Settings } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { UserNotification } from "../types/userNotification";
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

interface NotificationDropdownProps {
    className?: string;
}

export const NotificationDropdown = ({ className = "" }: NotificationDropdownProps) => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead } = useUserNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [showAllNotifications, setShowAllNotifications] = useState(false);
    const dropdownRef = useRef<HTMLButtonElement>(null);
    const { isMobile } = useScreenSize();

    
    // Close dropdown when clicking outside
    useClickOutside(dropdownRef as React.RefObject<HTMLElement>, () => setIsOpen(false));

    // Get last 5 notifications
    const recentNotifications = notifications.slice(0, 5);

    const handleNotificationClick = async (notification: UserNotification) => {
        // Mark as read if unread
        await markAsRead(notification.id);
        
        // Navigate based on notification type
        if (notification.type === "like" && notification.relatedId) {
            navigate(`/model/${notification.relatedId}`);
        } else if (notification.type === "follow" && notification.relatedId) {
            // For follow notifications, relatedId is the follower's ID
            navigate(`/user/${notification.relatedId}`);
        } else if (notification.type === "comment" && notification.relatedId) {
            navigate(`/model/${notification.relatedId}`);
        } else if (notification.type === "message" && notification.relatedId) {
            navigate(`/messages/${notification.relatedId}`);
        } else if (notification.type === "purchase" && notification.relatedId) {
            navigate(`/model/${notification.relatedId}`);
        } else if (notification.type === "sale" && notification.relatedId) {
            navigate(`/model/${notification.relatedId}`);
        } else if (notification.type === "download" && notification.relatedId) {
            navigate(`/model/${notification.relatedId}`);
        }
        
        // Close dropdown
        setIsOpen(false);
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

    const handleOpenNotificationsCenter = () => {
        setIsOpen(false);
        navigate("/notifications");
    };

    const handleViewAll = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowAllNotifications(!showAllNotifications);
    };

    const handleBellClick = () => {
        if (isMobile) {
            // On mobile, navigate directly to notifications page
            navigate("/notifications");
        } else {
            // On desktop, toggle dropdown
            setIsOpen(!isOpen);
        }
    };

    return (
        <button
            onClick={handleBellClick}
            className={`relative ${className}`}
            aria-label={isMobile ? "Go to notifications" : "Notifications"}
            ref={dropdownRef}
        >
            <MdNotifications className="h-7 w-7 text-txt-secondary hover:text-txt-primary transition-colors duration-200" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount > 99 ? "99+" : unreadCount}
                </span>
            )}

            {/* Notification Dropdown - Only show on desktop */}
            {isOpen && !isMobile && (
                <div className="absolute right-0 top-12 w-80 bg-bg-secondary border border-br-secondary rounded-xl shadow-xl z-50">
                    {/* Notifications Center Button - Top */}
                    <div className="border-b border-br-secondary/30 p-3">
                        <button
                            onClick={handleOpenNotificationsCenter}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-txt-secondary hover:text-txt-primary hover:bg-bg-surface rounded-lg transition-colors"
                        >
                            <Settings className="w-4 h-4" />
                            <span>Notifications Center</span>
                        </button>
                    </div>

                    {/* Notifications List */}
                    <div className={`${showAllNotifications ? 'max-h-[32rem]' : 'max-h-80'} overflow-y-auto p-2 custom-scrollbar transition-all duration-300`}>
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center">
                                <MdNotifications className="w-8 h-8 text-txt-tertiary mx-auto mb-2" />
                                <p className="text-txt-secondary text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-0.5">
                                {(showAllNotifications ? notifications : recentNotifications).map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className="cursor-pointer p-2 rounded-lg hover:bg-bg-surface/50 hover:border-br-primary/30 border border-transparent transition-all duration-200 flex items-center space-x-3"
                                    >
                                        {/* Profile Picture */}
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
                                                className="w-12 h-12 rounded-full object-cover border border-br-secondary/30 transition-colors"
                                            />
                                        </div>
                                        
                                        {/* Notification Text */}
                                         <div className="flex-1 min-w-0 text-left">
                                             <p className="text-sm text-txt-primary leading-tight">
                                                 {getNotificationText(notification)}
                                             </p>
                                                                                           {/* Time Ago */}
                                              <p className="text-xs text-txt-tertiary leading-tight mt-1">
                                                  {formatTimeAbbreviated(notification.createdAt)}
                                              </p>
                                         </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* View All Button - Bottom */}
                    <div className="border-t border-br-secondary/30 p-3">
                        <button
                            onClick={handleViewAll}
                            onMouseDown={(e) => e.preventDefault()}
                            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-txt-secondary hover:text-txt-primary hover:bg-bg-surface rounded-lg transition-colors"
                        >
                            <span>{showAllNotifications ? 'Show Less' : 'View All'}</span>
                        </button>
                    </div>
                </div>
            )}
        </button>
    );
};
