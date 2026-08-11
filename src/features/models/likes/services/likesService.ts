import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

const getLikeId = (modelId: string, userId: string): string => {
  return `${userId}_${modelId}`;
};

const getLikeRef = (modelId: string, userId: string) => {
  return doc(db, "likes", getLikeId(modelId, userId));
};

export async function toggleLike(modelId: string, userId: string): Promise<boolean> {
  if (!modelId || !userId) {
    throw new Error("modelId and userId are required.");
  }

  const likeRef = getLikeRef(modelId, userId);

  return runTransaction(db, async (transaction) => {
    const likeSnapshot = await transaction.get(likeRef);

    if (likeSnapshot.exists()) {
      transaction.delete(likeRef);
      return false;
    }

    transaction.set(likeRef, {
      userId,
      modelId,
      createdAt: serverTimestamp(),
    });

    return true;
  });
}

export async function isLiked(modelId: string, userId: string): Promise<boolean> {
  if (!modelId || !userId) {
    throw new Error("modelId and userId are required.");
  }

  const likeSnapshot = await getDoc(getLikeRef(modelId, userId));

  return likeSnapshot.exists();
}
