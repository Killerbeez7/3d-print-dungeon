import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Eye, ShoppingCart, MessageCircle, Heart, Download, Bell, User, Star } from "lucide-react";
import type { UserNotification } from "../types/userNotification";
import { useUserNotification } from "../hooks/useUserNotification";

interface UserNotificationItemProps {
  notification: UserNotification;
}

const getNotificationIcon = (type: UserNotification["type"]) => {
  switch (type) {
    case "purchase":
      return <ShoppingCart className="w-5 h-5 text-white" />;
    case "sale":
      return <Star className="w-5 h-5 text-white" />;
    case "message":
      return <MessageCircle className="w-5 h-5 text-white" />;
    case "like":
      return <Heart className="w-5 h-5 text-white" />;
    case "comment":
      return <MessageCircle className="w-5 h-5 text-white" />;
    case "follow":
      return <User className="w-5 h-5 text-white" />;
    case "download":
      return <Download className="w-5 h-5 text-white" />;
    case "system":
      return <Bell className="w-5 h-5 text-white" />;
    default:
      return <Bell className="w-5 h-5 text-white" />;
  }
};

const getNotificationStyles = (status: UserNotification["status"]) => {
  const baseStyles = "group relative flex items-start gap-4 p-4 rounded-xl border transition-all duration-300 hover:shadow-lg";
  
  switch (status) {
    case "unread":
      return `${baseStyles} bg-bg-secondary border-primary/30 hover:border-primary/50 hover:bg-bg-surface`;
    case "read":
      return `${baseStyles} bg-bg-secondary border-br-secondary hover:border-br-primary hover:bg-bg-surface`;
    case "archived":
      return `${baseStyles} bg-bg-secondary/80 border-br-secondary/50 opacity-75`;
    default:
      return `${baseStyles} bg-bg-secondary border-br-secondary`;
  }
};

const getStatusIndicator = (status: UserNotification["status"]) => {
  if (status === "unread") {
    return (
      <div className="absolute top-4 right-4">
        <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
      </div>
    );
  }
  return null;
};

export const UserNotificationItem = ({ notification }: UserNotificationItemProps) => {
  const { markAsRead, deleteNotification } = useUserNotification();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleMarkAsRead = async () => {
    if (notification.status === "unread") {
      await markAsRead(notification.id);
    }
  };

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
    <div className={getNotificationStyles(notification.status)}>
      {getStatusIndicator(notification.status)}
      
      {/* Icon */}
      <div className="flex-shrink-0 mt-1">
        <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
          {getNotificationIcon(notification.type)}
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className={`text-base font-semibold leading-tight ${
            notification.status === "unread" 
              ? "text-txt-primary" 
              : "text-txt-secondary"
          }`}>
            {notification.title}
          </h4>
          <span className="text-xs text-txt-secondary font-medium px-2 py-1 rounded-full bg-bg-primary/20 border border-br-secondary">
            {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
          </span>
        </div>
        
        {notification.message && (
          <p className={`text-sm leading-relaxed ${
            notification.status === "unread" 
              ? "text-txt-primary" 
              : "text-txt-secondary"
          }`}>
            {notification.message}
          </p>
        )}
        
        
      </div>
      
            {/* Actions */}
      <div className="flex flex-col gap-2">
        {notification.status === "unread" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAsRead();
            }}
            className="p-2 rounded-lg hover:bg-primary/20 transition-colors duration-200 group/btn bg-primary/10 border border-primary/20"
            aria-label="Mark as read"
            title="Mark as read"
          >
            <Eye className="w-4 h-4 text-primary group-hover/btn:scale-110 transition-transform" />
          </button>
        )}
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          disabled={isDeleting}
          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors duration-200 group/btn bg-red-500/10 border border-red-500/20 disabled:opacity-50"
          aria-label="Delete notification"
          title="Delete notification"
        >
          <Trash2 className="w-4 h-4 text-red-500 group-hover/btn:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  );
};
