import { useState } from "react";
import { Bell, Trash2, RefreshCw } from "lucide-react";
import { useUserNotification } from "../hooks/useUserNotification";
import { UserNotificationItem } from "./UserNotificationItem";
import { ClearAllConfirmModal } from "./ClearAllConfirmModal";
import { useScreenSize } from "@/hooks/useScreenSize";

interface UserNotificationContainerProps {
    className?: string;
}

export const UserNotificationContainer = ({
    className = "",
}: UserNotificationContainerProps) => {
    const { isMobile } = useScreenSize();
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        clearAllNotifications,
    } = useUserNotification();

    const [isOpen, setIsOpen] = useState(false);
    const [isClearingAll, setIsClearingAll] = useState(false);
    const [showClearAllModal, setShowClearAllModal] = useState(false);

    const handleClearAll = async () => {
        setShowClearAllModal(true);
    };

    const handleConfirmClearAll = async () => {
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
                <div className={`absolute ${isMobile ? 'right-0 left-0 mx-2' : 'right-0'} top-12 ${isMobile ? 'w-auto min-w-[280px] max-w-[calc(100vw-1rem)]' : 'w-96'} max-h-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50`}>
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
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
                                <RefreshCw
                                    className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600 ${
                                        isLoading ? "animate-spin" : ""
                                    }`}
                                />
                            </button>

                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    disabled={isClearingAll}
                                    className="p-1 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
                                    aria-label="Clear all notifications"
                                >
                                    <Trash2 className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-red-600`} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className={`${isMobile ? 'max-h-[60vh]' : 'max-h-80'} overflow-y-auto`}>
                        {isLoading ? (
                            <div className={`${isMobile ? 'p-6' : 'p-8'} text-center text-gray-500`}>
                                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                                <p className={`${isMobile ? 'text-sm' : 'text-base'}`}>Loading notifications...</p>
                            </div>
                        ) : error ? (
                            <div className={`${isMobile ? 'p-6' : 'p-8'} text-center text-red-500`}>
                                <p className={`${isMobile ? 'text-sm' : 'text-base'} mb-2`}>Failed to load notifications</p>
                                <button
                                    onClick={handleRefresh}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Try again
                                </button>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className={`${isMobile ? 'p-6' : 'p-8'} text-center text-gray-500`}>
                                <Bell className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} mx-auto mb-3 text-gray-300`} />
                                <p className={`${isMobile ? 'text-base' : 'text-lg'} font-medium mb-1`}>
                                    No notifications yet
                                </p>
                                <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                                    You&apos;ll see notifications about purchases,
                                    messages, and more here.
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
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
            )}

            {/* Backdrop */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            )}

            {/* Clear All Confirmation Modal */}
            <ClearAllConfirmModal
                isOpen={showClearAllModal}
                onClose={() => setShowClearAllModal(false)}
                onConfirm={handleConfirmClearAll}
                isLoading={isClearingAll}
                notificationCount={notifications.length}
            />
        </div>
    );
};
