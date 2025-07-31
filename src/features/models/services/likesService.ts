import { db } from "../../../config/firebaseConfig";
import {
    doc,
    getDoc,
    serverTimestamp,
    increment,
    DocumentReference,
    DocumentData,
    runTransaction,
} from "firebase/firestore";


export async function toggleLike(modelId: string, userId: string): Promise<boolean> {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    
    return runTransaction(db, async (transaction) => {
        const likeId = `${userId}_${modelId}`;
        const likeRef: DocumentReference<DocumentData> = doc(db, "likes", likeId);
        const modelRef: DocumentReference<DocumentData> = doc(db, "models", modelId);

        // Get both documents in the transaction
        const [likeSnap, modelSnap] = await Promise.all([
            transaction.get(likeRef),
            transaction.get(modelRef)
        ]);

        if (!modelSnap.exists()) {
            throw new Error("Model not found");
        }

        const modelData = modelSnap.data();
        const uploaderId = modelData.uploaderId;
        
        if (!uploaderId) {
            throw new Error("Model uploader ID not found");
        }

        const uploaderRef: DocumentReference<DocumentData> = doc(db, "users", uploaderId);

        if (likeSnap.exists()) {
            // Unlike: Remove like document, decrement model likes, decrement user likes
            transaction.delete(likeRef);
            transaction.update(modelRef, { likes: increment(-1) });
            transaction.update(uploaderRef, { likesCount: increment(-1) });
            return false;
        } else {
            // Like: Create like document, increment model likes, increment user likes
            transaction.set(likeRef, {
                userId,
                modelId,
                createdAt: serverTimestamp(),
            });
            transaction.update(modelRef, { likes: increment(1) });
            transaction.update(uploaderRef, { likesCount: increment(1) });
            return true;
        }
    });
}


export async function isLiked(modelId: string, userId: string): Promise<boolean> {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    const likeId = `${userId}_${modelId}`;
    const likeRef: DocumentReference<DocumentData> = doc(db, "likes", likeId);
    const likeSnap = await getDoc(likeRef);
    return likeSnap.exists();
}
