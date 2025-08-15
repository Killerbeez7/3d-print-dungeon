import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../shared/config.js";

//Update artist profile when user becomes an artist
export const updateArtistProfile = onCall(async ({ auth, data }) => {
    if (!auth) throw new HttpsError("unauthenticated", "Login required");

    const { uid } = auth;
    const { artistData } = data;

    if (!artistData) {
        throw new HttpsError("invalid-argument", "Artist data is required");
    }

    const publicRef = db.doc(`users/${uid}/public/data`);
    const artistRef = db.doc(`users/${uid}/artist/data`);

    // Update both user and artist documents
    const now = FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
        // Public-facing updates (whitelist)
        const publicUpdates = {
            isArtist: true,
            updatedAt: now,
        };
        if (artistData?.artistCategories) publicUpdates["artistCategories"] = artistData.artistCategories;
        if (artistData?.featuredWorks) publicUpdates["featuredWorks"] = artistData.featuredWorks;
        if (artistData?.publicCommissionRates) publicUpdates["publicCommissionRates"] = artistData.publicCommissionRates;

        transaction.set(publicRef, publicUpdates, { merge: true });

        // Private artist profile (secure)
        const privateUpdates = {
            uid,
            updatedAt: now,
        };
        // Whitelist private fields if provided
        if (artistData?.stripeConnectId) privateUpdates["stripeConnectId"] = artistData.stripeConnectId;
        if (artistData?.taxSettings) privateUpdates["taxSettings"] = artistData.taxSettings;
        if (artistData?.payoutSettings) privateUpdates["payoutSettings"] = artistData.payoutSettings;
        if (artistData?.commissionRates) privateUpdates["commissionRates"] = artistData.commissionRates;
        if (artistData?.notes) privateUpdates["notes"] = artistData.notes;

        transaction.set(artistRef, privateUpdates, { merge: true });
    });

    return { success: true };
});

// ================= FOLLOW FUNCTIONS ====================

export const toggleFollow = onCall(async ({ auth, data }) => {
    try {
        if (!auth) throw new HttpsError("unauthenticated", "Login required");
        const followerId = auth.uid;
        const followingId = data?.targetUserId;
        if (!followingId) throw new HttpsError("invalid-argument", "targetUserId is required");
        if (followerId === followingId) throw new HttpsError("failed-precondition", "Cannot follow yourself");

        const followRef = db.doc(`follows/${followerId}_${followingId}`);
        const followerPublicRef = db.doc(`users/${followerId}/public/data`);
        const followingPublicRef = db.doc(`users/${followingId}/public/data`);
        const now = FieldValue.serverTimestamp();

        const followDoc = await followRef.get();
        const isCurrentlyFollowing = followDoc.exists === true;

        await db.runTransaction(async (tx) => {
            // Ensure docs exist to allow nested stats updates
            tx.set(followerPublicRef, { updatedAt: now }, { merge: true });
            tx.set(followingPublicRef, { updatedAt: now }, { merge: true });

            if (isCurrentlyFollowing) {
                tx.delete(followRef);
                tx.update(followerPublicRef, { "stats.followingCount": FieldValue.increment(-1) });
                tx.update(followingPublicRef, { "stats.followersCount": FieldValue.increment(-1) });
            } else {
                tx.set(followRef, {
                    followerId,
                    followingId,
                    createdAt: now,
                });
                tx.update(followerPublicRef, { "stats.followingCount": FieldValue.increment(1) });
                tx.update(followingPublicRef, { "stats.followersCount": FieldValue.increment(1) });
            }
        });

        // Return latest status snapshot
        const [updatedFollowDoc, followerPublicDoc, followingPublicDoc] = await Promise.all([
            followRef.get(),
            followerPublicRef.get(),
            followingPublicRef.get(),
        ]);

        const followersCount = followingPublicDoc.exists
            ? Number(followingPublicDoc.get("stats.followersCount") || 0)
            : 0;
        const followingCount = followerPublicDoc.exists
            ? Number(followerPublicDoc.get("stats.followingCount") || 0)
            : 0;

        return {
            isFollowing: updatedFollowDoc.exists === true,
            followersCount,
            followingCount,
        };
    } catch (err) {
        console.error("[toggleFollow] Error:", err);
        const message = err && typeof err === "object" && err !== null && Object.prototype.hasOwnProperty.call(err, "message") ? String((err).message) : "toggleFollow failed";
        throw new HttpsError("internal", message);
    }
});

export const getFollowStatus = onCall(async ({ auth, data }) => {
    try {
        if (!auth) throw new HttpsError("unauthenticated", "Login required");
        const followerId = auth.uid;
        const followingId = data?.targetUserId;
        if (!followingId) throw new HttpsError("invalid-argument", "targetUserId is required");
        if (followerId === followingId) {
            return {
                isFollowing: false,
                followersCount: 0,
                followingCount: 0,
            };
        }

        const followRef = db.doc(`follows/${followerId}_${followingId}`);
        const followerPublicRef = db.doc(`users/${followerId}/public/data`);
        const followingPublicRef = db.doc(`users/${followingId}/public/data`);

        const [followDoc, followerPublicDoc, followingPublicDoc] = await Promise.all([
            followRef.get(),
            followerPublicRef.get(),
            followingPublicRef.get(),
        ]);

        const followersCount = followingPublicDoc.exists
            ? Number(followingPublicDoc.get("stats.followersCount") || 0)
            : 0;
        const followingCount = followerPublicDoc.exists
            ? Number(followerPublicDoc.get("stats.followingCount") || 0)
            : 0;

        return {
            isFollowing: followDoc.exists === true,
            followersCount,
            followingCount,
        };
    } catch (err) {
        console.error("[getFollowStatus] Error:", err);
        const message = err && typeof err === "object" && err !== null && Object.prototype.hasOwnProperty.call(err, "message") ? String((err).message) : "getFollowStatus failed";
        throw new HttpsError("internal", message);
    }
});