import Stripe from "stripe";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { HttpsError } from "firebase-functions/v2/https";

// Initialize Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

// Define secrets
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
console.log("✅ defineSecret works:", stripeSecretKey.name);

// Stripe setup
const getStripe = () => {
    const secretKey = stripeSecretKey.value();
    console.log("🚀 ~ getStripe: secretKey", secretKey ? "Loaded" : "Not Loaded");
    if (!secretKey) {
        throw new HttpsError("internal", "Stripe secret key not configured");
    }
    return new Stripe(secretKey, {
        apiVersion: "2024-04-10",
    });
};

// Helper -> fetch (or create) Stripe customer for a Firebase UID
const getOrCreateStripeCustomerId = async (uid, token) => {
    const userRef = db.collection("users").doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};

    if (userData.stripeCustomerId) {
        return userData.stripeCustomerId;
    }

    const stripe = getStripe();
    const customer = await stripe.customers.create({
        email: token?.email ?? undefined,
        name: userData.displayName || token?.name || undefined,
        metadata: { firebaseUID: uid },
    });

    await userRef.set(
        {
            stripeCustomerId: customer.id,
            updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
    );

    return customer.id;
};

export { app, db, stripeSecretKey, getStripe, getOrCreateStripeCustomerId };
