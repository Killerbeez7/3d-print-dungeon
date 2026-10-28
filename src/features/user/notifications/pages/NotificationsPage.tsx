import { useState } from "react";
import { BellOff, BellRing, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { useUserNotification, UserNotificationItem } from "@/features/user/notifications";

import { ClearAllConfirmModal } from "../components/ClearAllConfirmModal";

type Filter = "all" | "unread";

export const NotificationsPage = () => {
  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  const { notifications, unreadCount, isLoading, error, fetchNotifications, clearAllNotifications } =
    useUserNotification();

  const [showClearAllModal, setShowClearAllModal] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  if (!currentUser) {
    return (
      <StatePanel
        icon={BellRing}
        title="Sign in to see your notifications"
        actions={<Button onClick={() => open({ mode: "signin" })}>Sign in</Button>}
      >
        Likes, follows, comments and sales show up here.
      </StatePanel>
    );
  }

  const visible =
    filter === "unread"
      ? notifications.filter((notification) => notification.status === "unread")
      : notifications;

  const tabs: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: notifications.length },
    { id: "unread", label: "Unread", count: unreadCount },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="label-mono text-accent">Your account</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Notifications</h1>
        </div>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowClearAllModal(true)}
            leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
          >
            Clear all
          </Button>
        )}
      </header>

      <div role="tablist" aria-label="Show" className="mb-4 flex gap-1 border-b border-br-subtle">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            onClick={() => setFilter(tab.id)}
            className={`relative flex h-11 items-center gap-2 px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge ${
              filter === tab.id
                ? "text-txt-primary after:scale-x-100"
                : "text-txt-muted after:scale-x-0 hover:text-txt-primary"
            }`}
          >
            {tab.label}
            <span className={`font-mono text-xs ${tab.id === "unread" && tab.count > 0 ? "text-ember" : "text-txt-muted"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="divide-y divide-br-subtle rounded-xl border border-br-subtle bg-surface-card" role="status" aria-label="Loading notifications">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex items-center gap-4 px-5 py-4">
              <div className="skeleton-print chamfer size-11 [--cut:9px]" />
              <div className="flex-1 space-y-2">
                <div className="skeleton-print h-4 w-3/4" />
                <div className="skeleton-print h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <StatePanel
          icon={BellOff}
          title="Couldn't load notifications"
          headingLevel="h2"
          className="min-h-[40vh]"
          actions={
            <Button
              onClick={() => void fetchNotifications()}
              leftIcon={<RefreshCw className="size-4" aria-hidden="true" />}
            >
              Try again
            </Button>
          }
        >
          Check your connection and try again.
        </StatePanel>
      ) : visible.length === 0 ? (
        <StatePanel
          icon={filter === "unread" ? BellRing : BellOff}
          title={filter === "unread" ? "You're all caught up" : "No notifications yet"}
          headingLevel="h2"
          className="min-h-[40vh] rounded-xl border border-dashed border-br-secondary"
        >
          {filter === "unread"
            ? "Nothing new since you last looked."
            : "Likes, follows, comments and sales will show up here."}
        </StatePanel>
      ) : (
        <ul className="divide-y divide-br-subtle overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
          {visible.map((notification) => (
            <UserNotificationItem key={notification.id} notification={notification} />
          ))}
        </ul>
      )}

      <ClearAllConfirmModal
        isOpen={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        onConfirm={clearAllNotifications}
        notificationCount={notifications.length}
      />
    </div>
  );
};
