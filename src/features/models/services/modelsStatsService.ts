import { db } from "../../../config/firebaseConfig";
import {
    doc,
    updateDoc,
    increment,
    serverTimestamp,
    query,
    collection,
    where,
    getDocs,
} from "firebase/firestore";

// Increment the view count for a model
export const incrementModelViews = async (modelId: string): Promise<void> => {
    try {
        const modelRef = doc(db, "models", modelId);
        await updateDoc(modelRef, {
            views: increment(1),
            lastViewed: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error incrementing views:", error);
    }
};

// Utility function to recalculate user upload count
export async function recalculateUserUploadCount(userId: string): Promise<number> {
    try {
        // Get all models uploaded by this user
        const modelsQuery = query(
            collection(db, "models"),
            where("uploaderId", "==", userId)
        );
        const modelsSnapshot = await getDocs(modelsQuery);
        const actualCount = modelsSnapshot.size;

        // Update user's upload count
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            "stats.uploadsCount": actualCount,
        });

        console.log(`Recalculated upload count for user ${userId}: ${actualCount}`);
        return actualCount;
    } catch (error) {
        console.error("Error recalculating user upload count:", error);
        throw error;
    }
}

// Get model statistics
export async function getModelStats(modelId: string): Promise<{
    views: number;
    likes: number;
    purchaseCount: number;
    totalRevenue: number;
} | null> {
    try {
        const { getDoc } = await import("firebase/firestore");
        const modelRef = doc(db, "models", modelId);
        const modelSnap = await getDoc(modelRef);
        
        if (modelSnap.exists()) {
            const data = modelSnap.data();
            return {
                views: data.views || 0,
                likes: data.likes || 0,
                purchaseCount: data.purchaseCount || 0,
                totalRevenue: data.totalRevenue || 0,
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching model stats:", error);
        throw error;
    }
}

// Update model purchase statistics
export async function updateModelPurchaseStats(
    modelId: string, 
    purchaseAmount: number
): Promise<void> {
    try {
        const modelRef = doc(db, "models", modelId);
        await updateDoc(modelRef, {
            purchaseCount: increment(1),
            totalRevenue: increment(purchaseAmount),
            lastPurchased: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error updating model purchase stats:", error);
        throw error;
    }
}
