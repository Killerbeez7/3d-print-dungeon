import { https } from 'firebase-functions';
import { initializeApp, auth, firestore } from 'firebase-admin';

initializeApp();

export const setUserRole = https.onCall(async (data, context) => {
  // ─── 1) Gate-keep ──────────────────────────────────────────────────────────
  if (!context.auth || context.auth.token.super !== true) {
    throw new https.HttpsError(
      'permission-denied',
      'Only super-admins can change user roles.'
    );
  }

  // ─── 2) Validate input ─────────────────────────────────────────────────────
  const { uid, role, enable } = data || {};
  if (typeof uid !== 'string'
      || !['admin', 'moderator'].includes(role)
      || typeof enable !== 'boolean') {
    throw new https.HttpsError(
      'invalid-argument',
      'data must be { uid, role: "admin" | "moderator", enable: boolean }'
    );
  }

  // ─── 3) Update custom claims in Auth ───────────────────────────────────────
  const user     = await auth().getUser(uid);
  const claimsIn = user.customClaims || {};
  const claims   = { ...claimsIn };

  if (enable) {
    claims[role] = true;          // grant
  } else {
    delete claims[role];          // revoke
  }

  await auth().setCustomUserClaims(uid, claims);

  // ─── 4) Mirror to Firestore (optional, but nice for UI) ────────────────────
  const ref = firestore().doc(`users/${uid}`);
  await ref.set(
    {
      roles: enable
        ? firestore.FieldValue.arrayUnion(role)
        : firestore.FieldValue.arrayRemove(role)
    },
    { merge: true }
  );

  return { status: 'ok', claims };
});
