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
    const artistRef = db.collection("artists").doc(uid);
    const userRef = db.collection("users").doc(uid);

    // Update both user and artist documents
    const now = admin.firestore.FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
        // Update user document to mark as artist
        transaction.update(userRef, {
            isArtist: true,
            updatedAt: now,
        });

        // Update artist profile with public data
        transaction.set(
            artistRef,
            {
                uid: uid,
                isArtist: true,
                updatedAt: now,
                ...artistData, // This should only contain public fields
            },
            { merge: true }
        );
    });

    return { success: true };
});
