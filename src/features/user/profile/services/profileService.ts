import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";

import type { PublicProfile, PublicProfileView } from "../types/profile";

interface UsernameRegistryEntry {
  uid: string;
}

export async function getPublicProfileById(
  userId: string
): Promise<PublicProfileView | null> {
  const profileRef = doc(db, "users", userId, "public", "data");

  const snapshot = await getDoc(profileRef);

  if (!snapshot.exists()) {
    return null;
  }

  const profile = snapshot.data() as PublicProfile;

  return {
    ...profile,
    uid: userId,
  };
}

export async function getPublicProfileByUsername(
  username: string
): Promise<PublicProfileView | null> {
  const normalizedUsername = username.trim().toLowerCase();

  if (!normalizedUsername) {
    return null;
  }

  const usernameRef = doc(db, "usernames", normalizedUsername);
  const snapshot = await getDoc(usernameRef);

  if (!snapshot.exists()) {
    return null;
  }

  const { uid } = snapshot.data() as UsernameRegistryEntry;

  if (!uid) {
    return null;
  }

  return getPublicProfileById(uid);
}
