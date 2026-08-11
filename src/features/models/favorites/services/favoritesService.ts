import { doc, getDoc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

export async function toggleFavorite(userId: string, modelId: string): Promise<boolean> {
  if (!userId || !modelId) {
    throw new Error("userId and modelId are required");
  }

  const userRef = doc(db, "users", userId, "private", "data");

  return runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);

    if (!userSnapshot.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnapshot.data();
    const favorites: string[] = userData.favorites || [];

    if (favorites.includes(modelId)) {
      transaction.update(userRef, { favorites: arrayRemove(modelId) });

      return false;
    }

    transaction.update(userRef, { favorites: arrayUnion(modelId) });

    return true;
  });
}

export async function getFavoritesForUser(userId: string): Promise<string[]> {
  if (!userId) {
    throw new Error("userId is required");
  }

  const userRef = doc(db, "users", userId, "private", "data");
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    return [];
  }

  return userSnapshot.data().favorites || [];
}
