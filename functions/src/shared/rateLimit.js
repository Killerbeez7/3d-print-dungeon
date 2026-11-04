import { createHash } from "node:crypto";
import admin from "firebase-admin";
import { HttpsError } from "firebase-functions/v2/https";

/**
 * Fixed-window rate limit kept in Firestore (`rateLimits/{key}`; no browser can read or write
 * it). Each call counts one use of `key`; past `limit` uses within `windowSeconds` it throws
 * `resource-exhausted` with `message`. The `expireAt` field lets a Firestore TTL policy clean
 * old windows up.
 */
export async function enforceRateLimit(key, { limit, windowSeconds, message }) {
    const db = admin.firestore();
    const ref = db.collection("rateLimits").doc(key);
    const windowMs = windowSeconds * 1000;

    const allowed = await db.runTransaction(async (tx) => {
        const now = Date.now();
        const snap = await tx.get(ref);
        const data = snap.data();
        if (!data || now - data.windowStart >= windowMs) {
            tx.set(ref, {
                windowStart: now,
                count: 1,
                expireAt: admin.firestore.Timestamp.fromMillis(now + 2 * windowMs),
            });
            return true;
        }
        if (data.count >= limit) return false;
        tx.update(ref, { count: data.count + 1 });
        return true;
    });

    if (!allowed) throw new HttpsError("resource-exhausted", message);
}

/**
 * A short, one-way key for the caller's network address, so limits can apply to people who are
 * not signed in without storing their IP. Google's front end appends the real client address
 * as the last X-Forwarded-For entry; earlier entries come from the client and can be faked.
 */
export function clientKey(rawRequest) {
    const forwarded = String(rawRequest?.headers?.["x-forwarded-for"] ?? "")
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);
    const address = forwarded.at(-1) || rawRequest?.ip || "unknown";
    return createHash("sha256").update(`print-dungeon:${address}`).digest("hex").slice(0, 32);
}
