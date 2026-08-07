import { doc, getDoc } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import type { PublicProfileView } from "../types/user";

export async function getPublicProfile(
  userId: string
): Promise<PublicProfileView | null> {
  const profileRef = doc(db, "users", userId, "public", "data");

  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Omit<PublicProfileView, "uid">;

  return { ...data, uid: userId };
}
