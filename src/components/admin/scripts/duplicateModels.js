import { db } from "@/config/firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Duplicates all models in the Firestore 'models' collection for testing.
 * @param {function} onProgress - Callback to report progress (0-100)
 * @param {number} times - How many times to duplicate all models (default: 2)
 */
export async function duplicateModels(onProgress, times = 2) {
  const modelsCol = collection(db, "models");
  const snapshot = await getDocs(modelsCol);
  const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  let total = docs.length * times;
  let done = 0;
  for (let t = 0; t < times; t++) {
    for (const doc of docs) {
      const { id, createdAt, ...data } = doc; // eslint-disable-line
      const dataCopy = { ...data };
      dataCopy.createdAt = serverTimestamp();
      dataCopy.updatedAt = serverTimestamp();
      await addDoc(modelsCol, dataCopy);
      done++;
      onProgress(Math.round((done / total) * 100));
    }
  }
  onProgress(100);
} 