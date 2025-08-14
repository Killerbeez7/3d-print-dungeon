import { db } from "../../../config/firebaseConfig";
import {
    doc,
    getDoc,
    serverTimestamp,
    DocumentReference,
    DocumentData,
    runTransaction,
    collection,
    query,
    where,
    getCountFromServer,
} from "firebase/firestore";


export async function toggleLike(modelId: string, userId: string): Promise<boolean> {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    
    return runTransaction(db, async (transaction) => {
        const likeId = `${userId}_${modelId}`;
        const likeRef: DocumentReference<DocumentData> = doc(db, "likes", likeId);
        const likeSnap = await transaction.get(likeRef);

        if (likeSnap.exists()) {
            // Unlike: Remove like document
            transaction.delete(likeRef);
            return false;
        } else {
            // Like: Create like document
            transaction.set(likeRef, {
                userId,
                modelId,
                createdAt: serverTimestamp(),
            });
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

export async function getLikesCount(modelId: string): Promise<number> {
    if (!modelId) throw new Error("Missing modelId.");
    const q = query(collection(db, "likes"), where("modelId", "==", modelId));
    const snapshot = await getCountFromServer(q);
    const data: unknown = (snapshot as unknown as { data: () => { count?: number } }).data();
    const count = (data && (data as { count?: number }).count) ?? 0;
    return typeof count === "number" ? count : 0;
}
