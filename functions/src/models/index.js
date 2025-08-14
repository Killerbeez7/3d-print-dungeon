import admin from "firebase-admin";
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";

// When a like is created, increment model.likes and uploader public stats.likesCount
export const onLikeCreated = onDocumentCreated("likes/{likeId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const { modelId } = snap.data() || {};
    if (!modelId) return;

    const db = admin.firestore();
    const modelRef = db.doc(`models/${modelId}`);

    await db.runTransaction(async (tx) => {
        const modelSnap = await tx.get(modelRef);
        if (!modelSnap.exists) return;
        tx.update(modelRef, { likes: admin.firestore.FieldValue.increment(1) });

        const model = modelSnap.data() || {};
        const uploaderId = model.uploaderId;
        if (uploaderId) {
            const uploaderPublicRef = db.doc(`users/${uploaderId}/public/data`);
            tx.set(
                uploaderPublicRef,
                { stats: { likesCount: admin.firestore.FieldValue.increment(1) } },
                { merge: true }
            );
        }
    });
});

// When a like is deleted, decrement model.likes and uploader public stats.likesCount
export const onLikeDeleted = onDocumentDeleted("likes/{likeId}", async (event) => {
    const snap = event.data;
    if (!snap) return;
    const { modelId } = snap.data() || {};
    if (!modelId) return;

    const db = admin.firestore();
    const modelRef = db.doc(`models/${modelId}`);

    await db.runTransaction(async (tx) => {
        const modelSnap = await tx.get(modelRef);
        if (!modelSnap.exists) return;
        tx.update(modelRef, { likes: admin.firestore.FieldValue.increment(-1) });

        const model = modelSnap.data() || {};
        const uploaderId = model.uploaderId;
        if (uploaderId) {
            const uploaderPublicRef = db.doc(`users/${uploaderId}/public/data`);
            tx.set(
                uploaderPublicRef,
                { stats: { likesCount: admin.firestore.FieldValue.increment(-1) } },
                { merge: true }
            );
        }
    });
});