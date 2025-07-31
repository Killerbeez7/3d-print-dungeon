import { db } from "../../../config/firebaseConfig";
import { doc, getDoc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore";


export const toggleFavorite = async (userId: string, modelId: string): Promise<boolean> => {
    if (!userId || !modelId) throw new Error("Missing userId or modelId.");

    return runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", userId);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
            throw new Error("User not found");
        }

        const userData = userSnap.data();
        const favorites: string[] = userData.favorites || [];

        if (favorites.includes(modelId)) {
            // Remove from favorites
            transaction.update(userRef, { favorites: arrayRemove(modelId) });
            return false; // removed from favorites
        } else {
            // Add to favorites
            transaction.update(userRef, { favorites: arrayUnion(modelId) });
            return true; // added to favorites
        }
    });
};

export const getFavoritesForUser = async (userId: string): Promise<string[]> => {
    if (!userId) throw new Error("Missing userId.");
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data().favorites || []) : [];
};
