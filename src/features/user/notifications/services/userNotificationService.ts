import { db } from "@/config/firebaseConfig";
import {
  query,
  limit,
  where,
  orderBy,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import type { UserNotification, CreateNotificationData } from "../types/userNotification";

const COLLECTION_NAME = "userNotifications";

export class UserNotificationService {
  static async fetchUserNotifications(
    userId: string,
    limitCount = 50
  ): Promise<UserNotification[]> {
    try {
      const notificationsQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(notificationsQuery);

      return querySnapshot.docs.map((snapshot) => {
        const data = snapshot.data();

        return {
          ...data,
          id: snapshot.id,
          createdAt: data.createdAt?.toDate?.() ?? new Date(),
          readAt: data.readAt?.toDate?.() ?? undefined,
        } as UserNotification;
      });
    } catch (error) {
      console.error("Error fetching user notifications:", error);

      throw new Error("Failed to fetch notifications");
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, COLLECTION_NAME, notificationId);
      await updateDoc(notificationRef, {
        status: "read",
        readAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        where("status", "==", "unread")
      );

      const querySnapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((docSnapshot) => {
        const notificationRef = doc(db, COLLECTION_NAME, docSnapshot.id);
        batch.update(notificationRef, {
          status: "read",
          readAt: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Failed to mark all notifications as read");
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, COLLECTION_NAME, notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  }

  static async clearAllNotifications(userId: string): Promise<void> {
    try {
      const notificationsQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(notificationsQuery);
      const batch = writeBatch(db);

      querySnapshot.docs.forEach((docSnapshot) => {
        const notificationRef = doc(db, COLLECTION_NAME, docSnapshot.id);
        batch.delete(notificationRef);
      });

      await batch.commit();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw new Error("Failed to clear all notifications");
    }
  }

  static async createNotification(data: CreateNotificationData): Promise<string> {
    try {
      const notificationData = {
        ...data,
        status: "unread" as const,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), notificationData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsQuery = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        where("status", "==", "unread")
      );

      const querySnapshot = await getDocs(notificationsQuery);

      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting unread count:", error);

      throw new Error("Failed to fetch unread notification count");
    }
  }

  static async createPurchaseNotification(
    userId: string,
    modelId: string,
    modelName: string,
    price: number
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "purchase",
      title: "Purchase Successful!",
      message: `You've successfully purchased "${modelName}" for $${price.toFixed(2)}`,
      relatedId: modelId,
      relatedType: "model",
      metadata: { price, modelName },
    });
  }

  static async createSaleNotification(
    userId: string,
    modelId: string,
    modelName: string,
    price: number,
    buyerId: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "sale",
      title: "New Sale!",
      message: `"${modelName}" was purchased for $${price.toFixed(2)}`,
      relatedId: modelId,
      relatedType: "model",
      metadata: { price, modelName, buyerId },
    });
  }

  static async createMessageNotification(
    userId: string,
    senderId: string,
    senderName: string,
    messagePreview: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "message",
      title: `New message from ${senderName}`,
      message: messagePreview,
      relatedId: senderId,
      relatedType: "user",
      metadata: { senderId, senderName },
    });
  }

  static async createLikeNotification(
    userId: string,
    modelId: string,
    modelName: string,
    likerId: string,
    likerName: string
  ): Promise<string> {
    return this.createNotification({
      userId,
      type: "like",
      title: "New Like!",
      message: `${likerName} liked your model "${modelName}"`,
      relatedId: modelId,
      relatedType: "model",
      metadata: { likerId, likerName, modelName },
    });
  }
}
