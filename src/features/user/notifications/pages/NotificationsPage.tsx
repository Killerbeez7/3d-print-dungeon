import { useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useUserNotification } from "@/features/user/notifications";
import { UserNotificationItem } from "@/features/user/notifications";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { ClearAllConfirmModal } from "../components/ClearAllConfirmModal";
import { useScreenSize } from "@/hooks/useScreenSize";

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
            <div className={`${isMobile ? 'px-3' : 'px-4'} max-w-4xl mx-auto ${isMobile ? 'py-4' : 'py-8'}`}>
                {/* Header */}
                <div className={`${isMobile ? 'mb-4' : 'mb-8'}`}>
                    <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'} mb-4`}>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-3">
                                <div className={`${isMobile ? 'p-2' : 'p-3'} bg-primary/10 rounded-xl`}>
                                    <Bell className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-primary`} />
                                </div>
                                <div>
                                    <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-txt-primary`}>
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
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    disabled={isClearingAll}
                                    className={`flex items-center space-x-2 ${isMobile ? 'px-3 py-2 text-sm' : 'px-4 py-2'} bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 shadow-sm`}
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
                        <div className={`${isMobile ? 'p-8' : 'p-16'} text-center`}>
                            <div className="w-16 h-16 mx-auto mb-6">
                                <div className="w-full h-full border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            </div>
                            <h3 className="text-xl font-medium text-txt-primary mb-2">Loading...</h3>
                        </div>
                    ) : error ? (
                        <div className={`${isMobile ? 'p-8' : 'p-16'} text-center`}>
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
                        <div className={`${isMobile ? 'p-8' : 'p-16'} text-center`}>
                            <div className="w-20 h-20 mx-auto mb-6 text-txt-tertiary opacity-40">
                                <Bell className="w-full h-full" />
                            </div>
                            <h3 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-semibold text-txt-primary mb-3`}>No notifications yet</h3>
                            <p className="text-txt-secondary text-lg">
                                Start interacting with the platform to receive notifications!
                            </p>
                        </div>
                    ) : (
                        <div className={`${isMobile ? 'p-2' : 'p-4'} space-y-3`}>
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
