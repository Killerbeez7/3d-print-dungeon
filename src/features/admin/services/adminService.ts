import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions, auth } from "@/config/firebaseConfig";
import { refreshIdToken } from "@/features/auth/utils/refreshIdToken";

const adminCache = new Map<string, { ok: boolean; t: number }>(); // uid → { ok, t }
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes


export async function isCurrentUserAdmin(): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) return false;
    const claims = await refreshIdToken();
    return !!claims.admin;
}


export async function isAdmin(uid: string): Promise<boolean> {
    if (!uid) return false;
    // Check cache first
    const cached = adminCache.get(uid);
    if (cached && Date.now() - cached.t < CACHE_TTL) {
        return cached.ok;
    }
    // Cache miss or expired - fetch from Firestore
    const snap = await getDoc(doc(db, "users", uid));
    const ok = snap.exists() && Array.isArray(snap.data().roles) && snap.data().roles.includes("admin");
    adminCache.set(uid, { ok, t: Date.now() });
    return ok;
}

const setUserRole = httpsCallable(functions, "setUserRole");

type SetUserRoleResult = { success: boolean; message?: string }; // Adjust as needed

async function callWithFreshToken(payload: { uid: string; role: string; enable: boolean }): Promise<SetUserRoleResult> {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("No user is currently signed in");
        const claims = await refreshIdToken();
        if (!claims.admin) {
            throw new Error("Only admins can change user roles");
        }
        // call the cloud function
        const result = await setUserRole(payload);
        // Clear cache for the affected user since their roles changed
        adminCache.delete(payload.uid);
        // if the current user changed their own role, refresh token
        if (auth.currentUser && auth.currentUser.uid === payload.uid) {
            await refreshIdToken();
        }
        // If result.data is the actual payload, return result.data as SetUserRoleResult
        return result.data as SetUserRoleResult;
    } catch (error) {
        console.error("Operation failed:", error);
        throw error;
    }
}


export const grantRole = (uid: string, role: string): Promise<SetUserRoleResult> =>
    callWithFreshToken({ uid, role, enable: true });


export const revokeRole = (uid: string, role: string): Promise<SetUserRoleResult> =>
    callWithFreshToken({ uid, role, enable: false });
