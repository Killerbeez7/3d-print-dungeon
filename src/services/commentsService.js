import { db } from "../config/firebase";
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    addDoc,
    serverTimestamp,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

export async function fetchComments(modelId) {
    const q = query(
        collection(db, "comments"),
        where("modelId", "==", modelId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addComment(modelId, commentData) {
    return addDoc(collection(db, "comments"), {
        ...commentData,
        modelId,
        createdAt: serverTimestamp(),
    });
}

export async function deleteComment(commentId) {
    return deleteDoc(doc(db, "comments", commentId));
}

export async function editComment(commentId, newData) {
    return updateDoc(doc(db, "comments", commentId), newData);
}
