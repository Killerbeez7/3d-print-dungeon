import { db } from "../config/firebase";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";


export const toggleFavorite = async (userId: string, modelId: string): Promise<boolean> => {
    if (!userId || !modelId) throw new Error("Missing userId or modelId.");
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const favorites: string[] = userSnap.exists() ? (userSnap.data().favorites || []) : [];

    if (favorites.includes(modelId)) {
        await updateDoc(userRef, { favorites: arrayRemove(modelId) });
        return false; // removed from favorites
    } else {
        await updateDoc(userRef, { favorites: arrayUnion(modelId) });
        return true; // added to favorites
    }
};

export const getFavoritesForUser = async (userId: string): Promise<string[]> => {
    if (!userId) throw new Error("Missing userId.");
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? (userSnap.data().favorites || []) : [];
};
