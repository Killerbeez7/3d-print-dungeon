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

export interface UserNotificationMetadata {
  modelName?: string;

  userName?: string;
  senderName?: string;
  likerName?: string;
  followerName?: string;
  commenterName?: string;
  buyerName?: string;
  sellerName?: string;
  downloaderName?: string;

  senderId?: string;
  likerId?: string;
  buyerId?: string;

  userAvatar?: string;
  senderAvatar?: string;
  likerAvatar?: string;
  followerAvatar?: string;
  commenterAvatar?: string;
  buyerAvatar?: string;
  sellerAvatar?: string;
  downloaderAvatar?: string;
  photoURL?: string;

  price?: number;

  [key: string]: unknown;
}

export interface UserNotification {
  id: string;
  userId: string;
  type: UserNotificationType;
  title: string;
  message?: string;
  status: UserNotificationStatus;
  relatedId?: string;
  relatedType?: string;
  metadata?: UserNotificationMetadata;
  createdAt: Date;
  readAt?: Date;
}

export interface CreateNotificationData {
  userId: string;
  type: UserNotificationType;
  title: string;
  message?: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: UserNotificationMetadata;
}

export type CreateUserNotificationInput = Omit<CreateNotificationData, "userId">;

export interface UserNotificationContextValue {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (notification: CreateUserNotificationInput) => Promise<void>;
}
