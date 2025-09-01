import { db } from "@/config/firebaseConfig";
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  serverTimestamp,
  writeBatch
} from "firebase/firestore";
import type { UserNotification, CreateNotificationData } from "../types/userNotification";

const COLLECTION_NAME = "userNotifications";

export class UserNotificationService {
  // Fetch user notifications
  static async fetchUserNotifications(userId: string, limitCount: number = 50): Promise<UserNotification[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        readAt: doc.data().readAt?.toDate() || undefined,
      })) as UserNotification[];
    } catch (error) {
      console.error("Error fetching user notifications:", error);
      throw new Error("Failed to fetch notifications");
    }
  }

  // Mark notification as read
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

  // Mark all user notifications as read
  static async markAllAsRead(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        where("status", "==", "unread")
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach(docSnapshot => {
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

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, COLLECTION_NAME, notificationId);
      await deleteDoc(notificationRef);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  }

  // Clear all user notifications
  static async clearAllNotifications(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId)
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach(docSnapshot => {
        const notificationRef = doc(db, COLLECTION_NAME, docSnapshot.id);
        batch.delete(notificationRef);
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw new Error("Failed to clear all notifications");
    }
  }

  // Create new notification
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

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("userId", "==", userId),
        where("status", "==", "unread")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }

  // Create purchase notification
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
      metadata: { price, modelName }
    });
  }

  // Create sale notification
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
      metadata: { price, modelName, buyerId }
    });
  }

  // Create message notification
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
      metadata: { senderId, senderName }
    });
  }

  // Create like notification
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
      metadata: { likerId, likerName, modelName }
    });
  }

  // Test function to debug Firebase connectivity
  static async testFirebaseConnection(userId: string): Promise<boolean> {
    try {
      console.log("🧪 Testing Firebase connection...");
      console.log("🧪 Database instance:", db);
      
      // Try to create a simple test document in userNotifications collection
      // This will test both Firebase connection AND our security rules
      const testRef = collection(db, COLLECTION_NAME);
      const testDoc = await addDoc(testRef, { 
        userId: userId,
        type: "test",
        title: "Connection Test",
        message: "Testing Firebase connectivity",
        relatedId: "test",
        relatedType: "test",
        status: "unread",
        createdAt: serverTimestamp(),
        metadata: { test: true }
      });
      console.log("🧪 Test document created with ID:", testDoc.id);
      
      // Clean up test document
      await deleteDoc(testDoc);
      console.log("🧪 Test document cleaned up");
      
      console.log("✅ Firebase connection test successful");
      return true;
    } catch (error) {
      console.error("❌ Firebase connection test failed:", error);
      return false;
    }
  }

  // Create a test notification to verify the system works
  static async createTestNotification(userId: string): Promise<string> {
    console.log("🧪 Creating test notification for user:", userId);
    return this.createNotification({
      userId,
      type: "system",
      title: "Test Notification",
      message: "This is a test notification to verify the system is working",
      relatedId: "test",
      relatedType: "test",
      metadata: { test: true, timestamp: new Date().toISOString() }
    });
  }
}
