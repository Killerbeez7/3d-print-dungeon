import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import { requireAdmin } from "../shared/utils.js";

// User role claims (admin only)
export const setUserRole = onCall(async (request) => {
    try {
        const { data } = request;
        console.log("setUserRole called, auth:", request.auth);

        // Require admin authentication
        requireAdmin(request);

        // Validate input
        const { uid, role, enable } = data || {};
        if (
            typeof uid !== "string" ||
            typeof role !== "string" ||
            typeof enable !== "boolean"
        ) {
            throw new HttpsError(
                "invalid-argument",
                "data must be { uid, role: string, enable: boolean }"
            );
        }

        // Get current claims
        const user = await admin.auth().getUser(uid);
        const claims = { ...user.customClaims };

        if (enable) {
            claims[role] = true;
        } else {
            delete claims[role];
        }

        await admin.auth().setCustomUserClaims(uid, claims);

        // Mirror roles to firestore (for display/search)
        const enabledRoles = Object.keys(claims).filter((k) => claims[k] === true);
        const ref = admin.firestore().doc(`users/${uid}`);
        await ref.set(
            {
                roles: enabledRoles,
            },
            { merge: true }
        );

        return { status: "ok" };
    } catch (err) {
        console.error("setUserRole INTERNAL ERROR:", err);
        if (err instanceof HttpsError) {
            throw err;
        }
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});
