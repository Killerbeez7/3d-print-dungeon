import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from "firebase-admin";

//Update artist profile when user becomes an artist
export const updateArtistProfile = onCall(async ({ auth, data }) => {
    if (!auth) throw new HttpsError("unauthenticated", "Login required");

    const { uid } = auth;
    const { artistData } = data;

    if (!artistData) {
        throw new HttpsError("invalid-argument", "Artist data is required");
    }

    const db = admin.firestore();
    const publicRef = db.doc(`users/${uid}/public/data`);
    const artistRef = db.doc(`users/${uid}/artist/data`);

    // Update both user and artist documents
    const now = admin.firestore.FieldValue.serverTimestamp();

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
