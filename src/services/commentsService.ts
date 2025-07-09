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
    QueryDocumentSnapshot,
    DocumentData,
} from "firebase/firestore";

export interface Comment {
    id: string;
    modelId: string;
    userId: string;
    content: string;
    createdAt: Date | string | number;
    [key: string]: unknown;
}


export async function fetchComments(modelId: string): Promise<Comment[]> {
    const q = query(
        collection(db, "comments"),
        where("modelId", "==", modelId),
        orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        return {
            id: doc.id,
            modelId: data.modelId ?? "",
            userId: data.userId ?? "",
            content: data.content ?? "",
            createdAt: data.createdAt ?? "",
            ...data,
        } as Comment;
    });
}


export async function addComment(modelId: string, commentData: Omit<Comment, "id" | "modelId" | "createdAt">): Promise<void> {
    await addDoc(collection(db, "comments"), {
        ...commentData,
        modelId,
        createdAt: serverTimestamp(),
    });
}


export async function deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(db, "comments", commentId));
}


export async function editComment(commentId: string, newData: Partial<Comment>): Promise<void> {
    await updateDoc(doc(db, "comments", commentId), newData);
}
