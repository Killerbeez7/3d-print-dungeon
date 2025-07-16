import { db } from "../../../config/firebaseConfig";
import {
    doc,
    setDoc,
    deleteDoc,
    getDoc,
    updateDoc,
    serverTimestamp,
    increment,
    DocumentReference,
    DocumentData,
} from "firebase/firestore";


export async function toggleLike(modelId: string, userId: string): Promise<boolean> {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    const likeId = `${userId}_${modelId}`;
    const likeRef: DocumentReference<DocumentData> = doc(db, "likes", likeId);
    const likeSnap = await getDoc(likeRef);
    const modelRef: DocumentReference<DocumentData> = doc(db, "models", modelId);

    if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(modelRef, { likes: increment(-1) });
        return false;
    } else {
        await setDoc(likeRef, {
            userId,
            modelId,
            createdAt: serverTimestamp(),
        });
        await updateDoc(modelRef, { likes: increment(1) });
        return true;
    }
}


export async function isLiked(modelId: string, userId: string): Promise<boolean> {
    if (!modelId || !userId) throw new Error("Missing modelId or userId.");
    const likeId = `${userId}_${modelId}`;
    const likeRef: DocumentReference<DocumentData> = doc(db, "likes", likeId);
    const likeSnap = await getDoc(likeRef);
    return likeSnap.exists();
}
