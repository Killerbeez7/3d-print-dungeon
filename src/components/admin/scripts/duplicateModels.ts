import { db } from "@/config/firebase";
import { collection, getDocs, addDoc, serverTimestamp, DocumentData, CollectionReference } from "firebase/firestore";
import type { AdminModel } from "@/types/adminPanel";


export async function duplicateModels(
    onProgress: (progress: number) => void,
    times: number = 2
): Promise<void> {
    const modelsCol: CollectionReference<DocumentData> = collection(db, "models");
    const snapshot = await getDocs(modelsCol);
    const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AdminModel[];
    const total = docs.length * times;
    let done = 0;
    for (let t = 0; t < times; t++) {
        for (const doc of docs) {
            const { id: _id, createdAt: _createdAt, ...data } = doc;
            void _id;
            void _createdAt;
            const dataCopy: Record<string, unknown> = { ...data };
            dataCopy.createdAt = serverTimestamp();
            dataCopy.updatedAt = serverTimestamp();
            await addDoc(modelsCol, dataCopy);
            done++;
            onProgress(Math.round((done / total) * 100));
        }
    }
    onProgress(100);
} 