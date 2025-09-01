import { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { useUserNotification } from "@/features/user/notifications";
import { UserNotificationItem } from "@/features/user/notifications";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const NotificationsPage = () => {
    const { currentUser } = useAuth();
    const {
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAllAsRead,
        clearAllNotifications,
    } = useUserNotification();

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
        if (
            !confirm(
                "Are you sure you want to clear all notifications? This action cannot be undone."
            )
        ) {
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





    if (!currentUser) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-txt-primary mb-4">
                        Access Denied
                    </h1>
                    <p className="text-txt-secondary">
                        Please log in to view your notifications.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-primary/10 rounded-xl">
                            <Bell className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-txt-primary">
                                Notifications
                            </h1>
                            <p className="text-txt-secondary text-sm">
                                Stay updated with your activity
                            </p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full font-medium shadow-lg">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                            <span>{unreadCount} unread</span>
                        </div>
                    )}
                </div>

                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    disabled={isMarkingAllRead}
                                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 shadow-sm"
                                    title="Mark all as read"
                                >
                                    <Check className="w-4 h-4" />
                                    <span className="font-medium">Mark Read</span>
                                </button>
                            )}

                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    disabled={isClearingAll}
                                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 shadow-sm"
                                    title="Clear all notifications"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="font-medium">Clear All</span>
                                </button>
                            )}
                        </div>
                    </div>


                </div>

                {/* Content */}
                <div className="bg-bg-secondary rounded-xl border border-br-secondary overflow-hidden shadow-sm">
                    {isLoading ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto mb-6">
                                <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-medium text-txt-primary mb-2">Loading...</h3>
                        </div>
                    ) : error ? (
                        <div className="p-16 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 text-red-500">
                                <Bell className="w-full h-full" />
                            </div>
                            <h3 className="text-xl font-medium text-txt-primary mb-2">Failed to load notifications</h3>
                            <p className="text-txt-secondary mb-6 max-w-md mx-auto">{error}</p>
                            <button
                                onClick={() => fetchNotifications()}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                            >
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                Try again
                            </button>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <div className="w-20 h-20 mx-auto mb-6 text-txt-tertiary opacity-40">
                                <Bell className="w-full h-full" />
                            </div>
                            <h3 className="text-2xl font-semibold text-txt-primary mb-3">No notifications yet</h3>
                            <p className="text-txt-secondary text-lg">
                                Start interacting with the platform to receive notifications!
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
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
        </div>
    );
};
