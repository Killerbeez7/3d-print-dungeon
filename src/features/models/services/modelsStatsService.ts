import {
    doc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    increment,
    collection,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import type { ModelStats } from "../types/model";

export async function incrementModelViews(
    modelId: string
): Promise<void> {
    const modelRef = doc(db, "models", modelId);

    await updateDoc(modelRef, {
        views: increment(1),
        lastViewed: serverTimestamp(),
    });
};

export async function syncUserUploadCount(
    userId: string
): Promise<number> {
    const modelsQuery = query(
        collection(db, "models"),
        where("uploaderId", "==", userId)
    );

    const modelsSnapshot = await getDocs(modelsQuery);
    const uploadCount = modelsSnapshot.size;

    const userRef = doc(db, "users", userId);

    await updateDoc(userRef, {
        "stats.uploadsCount": uploadCount,
    });

    return uploadCount;
}

export async function getModelStats(
    modelId: string
): Promise<ModelStats | null> {
    const modelRef = doc(db, "models", modelId);
    const modelSnapshot = await getDoc(modelRef);

    if (!modelSnapshot.exists()) {
        return null;
    }

    const data = modelSnapshot.data();

    return {
        views: data.views ?? 0,
        likes: data.likes ?? 0,
        purchaseCount: data.purchaseCount ?? 0,
        totalRevenue: data.totalRevenue ?? 0,
    };
}

export async function updateModelPurchaseStats(
    modelId: string,
    purchaseAmount: number
): Promise<void> {
    const modelRef = doc(db, "models", modelId);

    await updateDoc(modelRef, {
        purchaseCount: increment(1),
        totalRevenue: increment(purchaseAmount),
        lastPurchased: serverTimestamp(),
    });
}
