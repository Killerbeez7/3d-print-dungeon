import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebaseConfig";
import type { PublicProfile, PublicProfileView } from "../types/user";


export const getUserById = async (uid: string): Promise<PublicProfileView | null> => {
    try {
        const publicRef = doc(db, `users/${uid}/public/data`);
        const snap = await getDoc(publicRef);
        if (!snap.exists()) return null;
        const p = snap.data() as PublicProfile;
        return { uid, ...p };
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw new Error("Failed to fetch user data");
    }
};


export const getUserByUsername = async (username: string): Promise<PublicProfileView | null> => {
    try {
        // Use usernames registry only (source of truth)
        const key = username.toLowerCase();
        const regRef = doc(db, "usernames", key);
        const regSnap = await getDoc(regRef);
        if (regSnap.exists()) {
            const uid = (regSnap.data() as { uid: string }).uid;
            return await getUserById(uid);
        }
        return null;
    } catch (error) {
        console.error("Error fetching user by username:", error);
        throw new Error("Failed to fetch user data");
    }
};
