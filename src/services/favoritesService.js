import { db } from "../firebase/firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";

// Toggle a model in the user's favorites (star icon action)
// This function updates only the user's document favorites array.
export const toggleFavorite = async (userId, modelId) => {
    if (!userId || !modelId) throw new Error("Missing userId or modelId.");
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const favorites = userSnap.exists() ? userSnap.data().favorites || [] : [];

    if (favorites.includes(modelId)) {
        await updateDoc(userRef, { favorites: arrayRemove(modelId) });
        return false; // removed from favorites
    } else {
        await updateDoc(userRef, { favorites: arrayUnion(modelId) });
        return true; // added to favorites
    }
};

// Retrieve all favorite model IDs for a user
export const getFavoritesForUser = async (userId) => {
    if (!userId) throw new Error("Missing userId.");
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data().favorites || [] : [];
};
