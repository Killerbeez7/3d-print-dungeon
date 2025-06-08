// src/services/adminService.js
import { doc, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/config/firebase";
import { refreshIdToken } from "@/utils/auth/refreshClaims";

/* ── small in-memory cache just like before ─────────────────────────── */
const adminCache = new Map(); // uid → { ok, t }
const CACHE_TTL = 5 * 60 * 1_000; // 5 minutes

export async function isAdmin(uid) {
    if (!uid) return false;

    const cached = adminCache.get(uid);
    if (cached && Date.now() - cached.t < CACHE_TTL) return cached.ok;

    const snap = await getDoc(doc(db, "users", uid));
    const ok = snap.exists() && (snap.data().roles || []).includes("admin");
    adminCache.set(uid, { ok, t: Date.now() });
    return ok;
}

/* ── always build the Functions *after* Auth is initialised ─────────── */
const setUserRole = httpsCallable(functions, "setUserRole");

/* ── wrappers that guarantee a fresh token on every call ────────────── */
async function callWithFreshToken(payload) {
    try {
        // First refresh token and get claims
        const claims = await refreshIdToken();
        console.debug("Current claims before operation:", claims);

        // Verify we have super admin
        if (!claims.super) {
            throw new Error("Only super-admins can change user roles");
        }

        // Call the cloud function
        return await setUserRole(payload);
    } catch (error) {
        console.error("Operation failed:", error);
        throw error;
    }
}

export const grantRole = (uid, role) => callWithFreshToken({ uid, role, enable: true });
export const revokeRole = (uid, role) => callWithFreshToken({ uid, role, enable: false });
export { callWithFreshToken as _debugForceRefresh }; // optional helper
