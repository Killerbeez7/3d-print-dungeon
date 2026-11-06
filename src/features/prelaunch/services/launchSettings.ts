import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";

/**
 * Admin switch for the coming-soon page (settings/launch, readable by all, written by admins).
 * comingSoon true (or no setting yet): visitors see the coming-soon page before launch.
 * false: everyone can use the site, e.g. to let a friend in to sign up.
 */
const LAUNCH_SETTINGS = doc(db, "settings", "launch");

export function subscribeComingSoon(onValue: (comingSoon: boolean) => void, onError: () => void): () => void {
  return onSnapshot(
    LAUNCH_SETTINGS,
    (snapshot) => onValue(snapshot.data()?.comingSoon !== false),
    () => onError(),
  );
}

export async function setComingSoon(comingSoon: boolean): Promise<void> {
  await setDoc(LAUNCH_SETTINGS, { comingSoon, updatedAt: serverTimestamp() }, { merge: true });
}
