export type UserNotificationType = 
  | "purchase" 
  | "message" 
  | "like" 
  | "comment" 
  | "follow" 
  | "sale" 
  | "download" 
  | "system";

export type UserNotificationStatus = "unread" | "read" | "archived";

export interface UserNotification {
  id: string;
  userId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  status: UserNotificationStatus;
  relatedId?: string; // ID of related model, message, etc.
  relatedType?: string; // Type of related item
  metadata?: Record<string, any>; // Additional data like price, sender, etc.
  createdAt: Date;
  readAt?: Date;
}

export interface UserNotificationContextValue {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notification: Omit<UserNotification, "id" | "createdAt" | "status">) => Promise<void>;
}

export interface CreateNotificationData {
  userId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: Record<string, any>;
}
