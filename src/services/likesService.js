import { db } from "../firebase/firebaseConfig";
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    increment,
} from "firebase/firestore";

// Toggle the like status for a model (heart icon action)
// This function creates or deletes a document in the "likes" collection
// and increments or decrements the 'likes' counter on the model document.
export const toggleLike = async (modelId, userId) => {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    const likeId = `${userId}_${modelId}`;
    const likeRef = doc(db, "likes", likeId);
    const likeSnap = await getDoc(likeRef);
    const modelRef = doc(db, "models", modelId);

    if (likeSnap.exists()) {
        // Remove like
        await deleteDoc(likeRef);
        await updateDoc(modelRef, { likes: increment(-1) });
        return false; // now not liked
    } else {
        // Add like
        await setDoc(likeRef, {
            userId,
            modelId,
            createdAt: serverTimestamp(),
        });
        await updateDoc(modelRef, { likes: increment(1) });
        return true; // now liked
    }
};

// Check if a model is liked by the user
export const isLiked = async (modelId, userId) => {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    const likeId = `${userId}_${modelId}`;
    const likeRef = doc(db, "likes", likeId);
    const likeSnap = await getDoc(likeRef);
    return likeSnap.exists();
};
