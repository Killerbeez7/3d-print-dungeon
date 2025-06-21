import admin from "firebase-admin";
import Stripe from "stripe";
import { initializeApp } from "firebase-admin/app";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
console.log("✅ defineSecret works:", stripeSecretKey.name);

const app = initializeApp();
const db = getFirestore(app);

// =========================================== STRIPE SETUP ===========================================

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

export const testStripeConnection = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async () => {
        try {
            const stripe = getStripe();
            const balance = await stripe.balance.retrieve();
            return { success: true, balance };
        } catch (err) {
            console.error("❌ Stripe test error:", err);
            throw new HttpsError("internal", "Stripe test failed", {
                error: err.message,
            });
        }
    }
);

// =========================================== STRIPE PAYMENT FUNCTIONS ===========================================

// create stripe customer
export const createStripeCustomer = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated.");
            }
            const { uid, token } = request.auth;

            const userDoc = await db.collection("users").doc(uid).get();
            const userData = userDoc.data();

            if (userData?.stripeCustomerId) {
                return { customerId: userData.stripeCustomerId };
            }

            const stripe = getStripe();
            const customer = await stripe.customers.create({
                email: token.email,
                name: userData?.displayName || token.name,
                metadata: { firebaseUID: uid },
            });

            await db.collection("users").doc(uid).update({
                stripeCustomerId: customer.id,
                updatedAt: FieldValue.serverTimestamp(),
            });

            return { customerId: customer.id };
        } catch (error) {
            console.error("❌ Error in createStripeCustomer:", error);
            throw new HttpsError("internal", "Failed to create Stripe customer.");
        }
    }
);

// create payment intent for model purchase
export const createPaymentIntent = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated.");
            }
            const { modelId, amount, currency = "usd" } = request.data;
            const { uid } = request.auth;

            if (!modelId || !amount) {
                throw new HttpsError(
                    "invalid-argument",
                    "modelId and amount are required."
                );
            }

            const modelDoc = await db.collection("models").doc(modelId).get();
            if (!modelDoc.exists) {
                throw new HttpsError("not-found", "Model not found.");
            }
            const modelData = modelDoc.data();

            const { customerId } = await createStripeCustomer(request);

            const stripe = getStripe();
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100),
                currency,
                customer: customerId,
                metadata: {
                    modelId,
                    buyerId: uid,
                    sellerId: modelData.uploaderId,
                    modelName: modelData.name,
                },
                automatic_payment_methods: { enabled: true },
            });

            await db.collection("paymentIntents").doc(paymentIntent.id).set({
                id: paymentIntent.id,
                modelId,
                buyerId: uid,
                sellerId: modelData.uploaderId,
                amount,
                currency,
                status: "created",
                createdAt: FieldValue.serverTimestamp(),
            });

            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
            };
        } catch (error) {
            console.error("❌ Error in createPaymentIntent:", error);
            throw new HttpsError("internal", `Payment creation failed: ${error.message}`);
        }
    }
);

// create subscription for premium features
export const createSubscription = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated.");
            }
            const { priceId, paymentMethodId } = request.data;
            const { uid } = request.auth;

            if (!priceId) {
                throw new HttpsError("invalid-argument", "priceId is required.");
            }

            const { customerId } = await createStripeCustomer(request);

            const stripe = getStripe();
            if (paymentMethodId) {
                await stripe.paymentMethods.attach(paymentMethodId, {
                    customer: customerId,
                });
                await stripe.customers.update(customerId, {
                    invoice_settings: { default_payment_method: paymentMethodId },
                });
            }

            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{ price: priceId }],
                payment_behavior: "default_incomplete",
                payment_settings: { save_default_payment_method: "on_subscription" },
                expand: ["latest_invoice.payment_intent"],
            });

            await db
                .collection("subscriptions")
                .doc(subscription.id)
                .set({
                    id: subscription.id,
                    userId: uid,
                    customerId,
                    priceId,
                    status: subscription.status,
                    currentPeriodStart: new Date(
                        subscription.current_period_start * 1000
                    ),
                    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                    createdAt: FieldValue.serverTimestamp(),
                });

            return {
                subscriptionId: subscription.id,
                clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            };
        } catch (error) {
            console.error("❌ Error creating subscription:", error);
            throw new HttpsError("internal", "Failed to create subscription.");
        }
    }
);

// handle payment success
export const handlePaymentSuccess = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated.");
            }
            const { paymentIntentId } = request.data;

            if (!paymentIntentId) {
                throw new HttpsError("invalid-argument", "paymentIntentId is required.");
            }

            const paymentDoc = await db
                .collection("paymentIntents")
                .doc(paymentIntentId)
                .get();
            if (!paymentDoc.exists) {
                throw new HttpsError("not-found", "Payment intent not found.");
            }
            const paymentData = paymentDoc.data();

            const stripe = getStripe();
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== "succeeded") {
                throw new HttpsError("failed-precondition", "Payment not completed.");
            }

            const purchaseId = db.collection("purchases").doc().id;
            await db
                .collection("purchases")
                .doc(purchaseId)
                .set({
                    id: purchaseId,
                    ...paymentData,
                    status: "completed",
                    purchasedAt: FieldValue.serverTimestamp(),
                });

            await db
                .collection("users")
                .doc(paymentData.buyerId)
                .update({
                    purchasedModels: FieldValue.arrayUnion(paymentData.modelId),
                });

            await db
                .collection("users")
                .doc(paymentData.sellerId)
                .update({
                    totalSales: FieldValue.increment(paymentData.amount),
                    salesCount: FieldValue.increment(1),
                });

            await db
                .collection("models")
                .doc(paymentData.modelId)
                .update({
                    purchaseCount: FieldValue.increment(1),
                    totalRevenue: FieldValue.increment(paymentData.amount),
                });

            await db.collection("paymentIntents").doc(paymentIntentId).update({
                status: "completed",
                completedAt: FieldValue.serverTimestamp(),
            });

            return { success: true, purchaseId };
        } catch (error) {
            console.error("❌ Error handling payment success:", error);
            throw new HttpsError("internal", "Failed to process payment success.");
        }
    }
);

// get user's purchases
export const getUserPurchases = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated.");
            }
            const { uid } = request.auth;

            const purchasesSnapshot = await db
                .collection("purchases")
                .where("buyerId", "==", uid)
                .orderBy("purchasedAt", "desc")
                .get();

            const purchases = [];
            for (const doc of purchasesSnapshot.docs) {
                const purchaseData = doc.data();
                const modelDoc = await db
                    .collection("models")
                    .doc(purchaseData.modelId)
                    .get();
                purchases.push({
                    ...purchaseData,
                    model: modelDoc.exists ? modelDoc.data() : null,
                });
            }
            return { purchases };
        } catch (error) {
            console.error("❌ Error in getUserPurchases:", error);
            throw new HttpsError("internal", "Failed to get purchases.");
        }
    }
);

// get seller's sales
export const getSellerSales = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            if (!request.auth) {
                throw new HttpsError("unauthenticated", "User must be authenticated.");
            }
            const { uid } = request.auth;

            const salesSnapshot = await db
                .collection("purchases")
                .where("sellerId", "==", uid)
                .orderBy("purchasedAt", "desc")
                .get();

            const sales = [];
            for (const doc of salesSnapshot.docs) {
                const saleData = doc.data();
                const modelDoc = await db
                    .collection("models")
                    .doc(saleData.modelId)
                    .get();
                const buyerDoc = await db.collection("users").doc(saleData.buyerId).get();
                sales.push({
                    ...saleData,
                    model: modelDoc.exists ? modelDoc.data() : null,
                    buyer: buyerDoc.exists
                        ? {
                              displayName: buyerDoc.data().displayName,
                              photoURL: buyerDoc.data().photoURL,
                          }
                        : null,
                });
            }
            return { sales };
        } catch (error) {
            console.error("❌ Error getting seller sales:", error);
            throw new HttpsError("internal", "Failed to get seller sales.");
        }
    }
);

// Create Stripe Connect account for a seller
export const createConnectAccount = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        console.log("⚡️ [createConnectAccount] Triggered");

        const { auth } = request;
        if (!auth || !auth.uid) {
            console.error("❌ [createConnectAccount] Unauthenticated request:", { auth });
            throw new HttpsError("unauthenticated", "User must be logged in");
        }

        console.log("✅ [createConnectAccount] Authenticated:", {
            uid: auth.uid,
            email: auth.token.email,
        });

        try {
            console.log("Attempting to initialize Stripe...");
            const stripe = getStripe();
            console.log("Stripe initialized successfully.");

            console.log("Attempting to create Stripe Express account for email:", auth.token.email);
            const account = await stripe.accounts.create({
                type: "express",
                email: auth.token.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    firebaseUID: auth.uid,
                },
            });

            console.log("✅ [createConnectAccount] Stripe account created:", {
                accountId: account.id,
            });

            await db.collection("users").doc(auth.uid).update({
                stripeConnectId: account.id,
                updatedAt: FieldValue.serverTimestamp(),
            });

            console.log("✅ [createConnectAccount] Firestore user updated");

            return { accountId: account.id };
        } catch (error) {
            console.error("❌❌❌ FATAL [createConnectAccount] Error:", error);
            if (error.type) {
                console.error("Stripe Error Type:", error.type);
            }
            throw new HttpsError("internal", "Failed to create Connect account.", {
                errorMessage: error.message,
            });
        }
    }
);

// Generate onboarding link for a Stripe Connect account
export const createAccountLink = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        console.log("⚡️ [createAccountLink] Triggered");

        const { auth, data } = request;
        const { accountId, refreshUrl, returnUrl } = data;

        console.log("ℹ️ [createAccountLink] Data received:", {
            accountId,
            refreshUrl,
            returnUrl,
        });

        if (!auth || !auth.uid) {
            console.error("❌ [createAccountLink] Unauthenticated request:", { auth });
            throw new HttpsError("unauthenticated", "User must be logged in");
        }

        console.log("✅ [createAccountLink] Authenticated:", { uid: auth.uid });

        try {
            const stripe = getStripe();
            console.log("✅ [createAccountLink] Stripe initialized");

            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: refreshUrl,
                return_url: returnUrl,
                type: "account_onboarding",
            });

            console.log("✅ [createAccountLink] Link created:", { url: accountLink.url });

            return { url: accountLink.url };
        } catch (error) {
            console.error("❌ [createAccountLink] Error:", error.message || error);
            throw new HttpsError("internal", "Failed to create account onboarding link", {
                error: error.message,
            });
        }
    }
);

// =========================================== EXISTING FUNCTIONS ===========================================

// Constants
const COOLDOWN_MS = 60 * 60 * 1000;
const BATCH_SIZE = 100;
const VIEW_BUFFER_COLLECTION = "viewBuffer";

// Cache for recent views
const recentViewsCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

// Clean cache periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of recentViewsCache.entries()) {
        if (now - timestamp > CACHE_TTL) {
            recentViewsCache.delete(key);
        }
    }
}, CACHE_TTL);

// Hybrid view tracking - immediate update + buffer for analytics
export const trackModelView = onCall(async (request) => {
    try {
        const { modelId, viewerId } = request.data;

        if (!modelId || !viewerId) {
            throw new HttpsError("invalid-argument", "modelId and viewerId required");
        }

        const viewKey = `${modelId}_${viewerId}`;
        const now = Date.now();

        // Check cache first
        const lastView = recentViewsCache.get(viewKey);
        if (lastView && now - lastView < COOLDOWN_MS) {
            return { success: false, reason: "cooldown" };
        }

        // Use transaction for immediate update
        await db.runTransaction(async (transaction) => {
            const modelRef = db.collection("models").doc(modelId);
            transaction.update(modelRef, {
                views: FieldValue.increment(1),
                lastViewedAt: FieldValue.serverTimestamp(),
            });

            // Log to buffer for analytics/deduplication
            const viewBufferRef = db.collection(VIEW_BUFFER_COLLECTION).doc();
            transaction.set(viewBufferRef, {
                modelId,
                viewerId,
                timestamp: FieldValue.serverTimestamp(),
                processed: false,
            });
        });

        recentViewsCache.set(viewKey, now);

        return { success: true, message: "View tracked immediately" };
    } catch (error) {
        console.error("Error tracking view:", error);
        throw new HttpsError("internal", "Failed to track view");
    }
});

// Analytics processor - runs every 5 minutes for user engagement analytics
export const processViewAnalytics = onSchedule("*/5 * * * *", async () => {
    try {
        console.log(
            "Starting view analytics processing (analytics only, no view count changes)..."
        );

        // Get unprocessed view events from buffer
        const pendingViews = await db
            .collection(VIEW_BUFFER_COLLECTION)
            .where("processed", "==", false)
            .limit(BATCH_SIZE)
            .get();

        if (pendingViews.empty) {
            console.log("No pending view events for analytics processing");
            return null;
        }

        const batch = db.batch();
        const viewerEngagement = new Map();

        // Process events for user engagement analytics
        pendingViews.docs.forEach((doc) => {
            const data = doc.data();
            const { modelId, viewerId, timestamp } = data;

            // Aggregate viewer engagement data for analytics
            const engagementKey = `${modelId}_${viewerId}`;
            if (!viewerEngagement.has(engagementKey)) {
                viewerEngagement.set(engagementKey, {
                    modelId,
                    viewerId,
                    sessionViews: 0,
                    lastViewAt: timestamp,
                });
            }
            viewerEngagement.get(engagementKey).sessionViews++;

            batch.update(doc.ref, { processed: true });
        });

        // Update viewer engagement analytics
        for (const [key, engagement] of viewerEngagement.entries()) {
            const analyticsRef = db.collection("viewerActivity").doc(key);
            batch.set(
                analyticsRef,
                {
                    modelId: engagement.modelId,
                    viewerId: engagement.viewerId,
                    totalEngagements: FieldValue.increment(engagement.sessionViews),
                    lastEngagementAt: engagement.lastViewAt,
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );
        }

        await batch.commit();

        console.log(`✅ Processed ${pendingViews.size} view events for analytics`);
        return null;
    } catch (error) {
        console.error("Error processing view analytics:", error);
        return null;
    }
});

// Get view count (for analytics)
export const getModelViewCount = onCall(async (request) => {
    try {
        const { modelId } = request.data;

        if (!modelId) {
            throw new HttpsError("invalid-argument", "modelId required");
        }

        const modelDoc = await db.collection("models").doc(modelId).get();

        if (!modelDoc.exists) {
            throw new HttpsError("not-found", "Model not found");
        }

        return { viewCount: modelDoc.data().views || 0 };
    } catch (error) {
        console.error("Error getting view count:", error);
        throw new HttpsError("internal", "Failed to get view count");
    }
});

// Cleanup old processed views buffer
export const cleanupViewBuffer = onSchedule("0 2 * * *", async () => {
    try {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const oldViews = await db
            .collection(VIEW_BUFFER_COLLECTION)
            .where("processed", "==", true)
            .where("timestamp", "<", oneDayAgo)
            .limit(500)
            .get();

        if (oldViews.empty) {
            console.log("No old view buffer entries to clean up");
            return null;
        }

        const batch = db.batch();
        oldViews.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        console.log(`Cleaned up ${oldViews.size} old view buffer entries`);
        return null;
    } catch (error) {
        console.error("Error cleaning up view buffer:", error);
        return null;
    }
});

// User role claims (admin only)
export const setUserRole = onCall(async (request) => {
    try {
        const { data, auth } = request;
        console.log("setUserRole called, auth:", auth);

        // is authenticated?
        if (!auth) {
            throw new HttpsError(
                "unauthenticated",
                "You must be logged in to perform this action."
            );
        }

        // is admin?
        if (auth.token.admin !== true) {
            throw new HttpsError(
                "permission-denied",
                "Only admins can change user roles."
            );
        }

        // validate input
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

        // get current claims
        const user = await admin.auth().getUser(uid);
        const claims = { ...user.customClaims };

        if (enable) {
            claims[role] = true;
        } else {
            delete claims[role];
        }

        await admin.auth().setCustomUserClaims(uid, claims);

        // mirror roles to firestore (for display/search)
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
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});
