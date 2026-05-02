import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import {
    stripeSecretKey,
    stripeWebhookSecret,
    getStripe,
    getOrCreateStripeCustomerId,
    db,
} from "../shared/config.js";
import { requireAuth, validateRequiredFields, handleError } from "../auth/utils.js";

// Test Stripe connection
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

// Create Stripe customer
export const createStripeCustomer = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            const { uid, token } = requireAuth(request);
            const customerId = await getOrCreateStripeCustomerId(uid, token);
            return { customerId };
        } catch (error) {
            handleError(error, "createStripeCustomer");
        }
    }
);

// Create payment intent
export const createPaymentIntent = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            const { uid, token } = requireAuth(request);
            const { modelId, amount, currency = "usd" } = request.data;

            validateRequiredFields(request.data, ["modelId", "amount"]);

            const modelDoc = await db.collection("models").doc(modelId).get();
            if (!modelDoc.exists) {
                throw new HttpsError("not-found", "Model not found.");
            }
            const modelData = modelDoc.data();

            const customerId = await getOrCreateStripeCustomerId(uid, token);
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
            handleError(error, "createPaymentIntent");
        }
    }
);

// Create subscription
export const createSubscription = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            const { uid } = requireAuth(request);
            const { priceId, paymentMethodId } = request.data;

            validateRequiredFields(request.data, ["priceId"]);

            const customerId = await getOrCreateStripeCustomerId(uid, request.auth.token);
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
            handleError(error, "createSubscription");
        }
    }
);

// Handle payment success
export const handlePaymentSuccess = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            requireAuth(request);
            const { paymentIntentId } = request.data;

            validateRequiredFields(request.data, ["paymentIntentId"]);

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

            // Record private purchase doc instead of array field
            await db
                .doc(`users/${paymentData.buyerId}/purchases/${paymentData.modelId}`)
                .set(
                    {
                        modelId: paymentData.modelId,
                        purchasedAt: FieldValue.serverTimestamp(),
                        pricePaidCents: Math.round(paymentData.amount * 100),
                        currency: paymentData.currency,
                    },
                    { merge: true }
                );

            // Increment seller public stats
            await db
                .doc(`users/${paymentData.sellerId}/public/data`)
                .set({}, { merge: true });
            await db.doc(`users/${paymentData.sellerId}/public/data`).update({
                "stats.viewsCount": FieldValue.increment(0),
                "stats.uploadsCount": FieldValue.increment(0),
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
            handleError(error, "handlePaymentSuccess");
        }
    }
);

// Get user purchases
export const getUserPurchases = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            const { uid } = requireAuth(request);

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
            handleError(error, "getUserPurchases");
        }
    }
);

// // Get seller sales
export const getSellerSales = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            const { uid } = requireAuth(request);

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
                const buyerDoc = await db
                    .doc(`users/${saleData.buyerId}/public/data`)
                    .get();
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
            handleError(error, "getSellerSales");
        }
    }
);

// Create account link
export const createAccountLink = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        console.log("⚡️ [createAccountLink] Triggered");

        try {
            requireAuth(request);
            const { accountId, refreshUrl, returnUrl } = request.data;

            console.log("ℹ️ [createAccountLink] Data received:", {
                accountId,
                refreshUrl,
                returnUrl,
            });

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

// // Create Stripe Connect account
export const createConnectAccount = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        console.log("⚡️ [createConnectAccount] Triggered");

        try {
            const { uid, token } = requireAuth(request);
            console.log("✅ [createConnectAccount] Authenticated:", {
                uid,
                email: token.email,
            });

            const stripe = getStripe();
            console.log("Stripe initialized successfully.");

            const account = await stripe.accounts.create({
                type: "express",
                email: token.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                metadata: {
                    firebaseUID: uid,
                },
            });

            console.log("✅ [createConnectAccount] Stripe account created:", {
                accountId: account.id,
            });

            await db.doc(`users/${uid}/private/data`).set(
                {
                    stripeConnectId: account.id,
                    // Initialize status snapshot: account exists but not active yet
                    stripeConnectStatus: {
                        accountId: account.id,
                        isEnabledForCharges: false,
                        detailsSubmitted: false,
                        requirementsDue: [],
                        isFullyActive: false,
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    updatedAt: FieldValue.serverTimestamp(),
                },
                { merge: true }
            );

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

// Check Stripe Connect account status
export const checkConnectStatus = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        console.log("⚡️ [checkConnectStatus] Triggered");

        try {
            const { uid } = requireAuth(request);
            console.log("✅ [checkConnectStatus] Authenticated:", { uid });

            const userPrivateSnap = await db.doc(`users/${uid}/private/data`).get();
            const userPrivate = userPrivateSnap.exists ? userPrivateSnap.data() : {};
            const stripeConnectId = userPrivate?.stripeConnectId || null;

            console.log("ℹ️ [checkConnectStatus] User data:", {
                hasConnectId: !!stripeConnectId,
                connectId: stripeConnectId,
                cachedStatus: userPrivate?.stripeConnectStatus,
            });

            if (!stripeConnectId) {
                console.log("ℹ️ [checkConnectStatus] No Connect account found");
                return {
                    hasConnectAccount: false,
                    accountId: null,
                    isEnabledForCharges: false,
                    detailsSubmitted: false,
                    requirementsDue: [],
                    isFullyActive: false,
                };
            }

            const stripe = getStripe();
            console.log("✅ [checkConnectStatus] Stripe initialized");

            const account = await stripe.accounts.retrieve(stripeConnectId);
            console.log("✅ [checkConnectStatus] Account retrieved:", {
                accountId: account.id,
                chargesEnabled: account.charges_enabled,
                detailsSubmitted: account.details_submitted,
                requirementsDue: account.requirements?.currently_due,
            });

            const status = {
                hasConnectAccount: true,
                accountId: account.id,
                isEnabledForCharges: Boolean(account.charges_enabled),
                detailsSubmitted: Boolean(account.details_submitted),
                requirementsDue: Array.isArray(account.requirements?.currently_due)
                    ? account.requirements.currently_due
                    : [],
                // Only fully active when charges are enabled and details are submitted
                isFullyActive: Boolean(
                    account.charges_enabled &&
                        account.details_submitted &&
                        (!account.requirements?.currently_due ||
                            account.requirements.currently_due.length === 0)
                ),
            };

            console.log("✅ [checkConnectStatus] Status calculated:", status);

            // Cache a lightweight status snapshot in private data for quick checks
            await db.doc(`users/${uid}/private/data`).set(
                {
                    stripeConnectStatus: {
                        accountId: status.accountId,
                        isEnabledForCharges: status.isEnabledForCharges,
                        detailsSubmitted: status.detailsSubmitted,
                        requirementsDue: status.requirementsDue,
                        isFullyActive: status.isFullyActive,
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                },
                { merge: true }
            );

            console.log("✅ [checkConnectStatus] Status cached in Firestore");
            return status;
        } catch (error) {
            console.error("❌ [checkConnectStatus] Error:", error);
            handleError(error, "checkConnectStatus");
        }
    }
);

// Stripe webhook handler for account updates
export const stripeWebhook = onRequest(
    {
        secrets: [stripeSecretKey, stripeWebhookSecret],
        invoker: "public", // Allow unauthenticated invocations for Stripe webhooks
    },
    async (request, response) => {
        console.log("🔄 [Webhook] ===== WEBHOOK REQUEST RECEIVED =====");
        console.log("🔄 [Webhook] Timestamp:", new Date().toISOString());
        console.log("🔄 [Webhook] Method:", request.method);
        console.log("🔄 [Webhook] URL:", request.url);
        console.log("🔄 [Webhook] Content-Type:", request.headers["content-type"]);
        console.log(
            "🔄 [Webhook] Stripe-Signature present:",
            !!request.headers["stripe-signature"]
        );
        console.log(
            "🔄 [Webhook] Raw body length:",
            request.rawBody?.length || "undefined"
        );

        const sig = request.headers["stripe-signature"];
        const endpointSecret = stripeWebhookSecret.value();

        console.log("🔄 [Webhook] Stripe signature present:", !!sig);
        console.log("🔄 [Webhook] Endpoint secret present:", !!endpointSecret);

        let event;

        try {
            const stripe = getStripe();
            console.log("🔄 [Webhook] Constructing event from raw body...");
            event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
            console.log("✅ [Webhook] Event constructed successfully:", {
                type: event.type,
                id: event.id,
                created: event.created,
                data: {
                    object: event.data.object.id,
                    objectType: event.data.object.object,
                },
            });
        } catch (err) {
            console.error("❌ [Webhook] Signature verification failed:", err.message);
            console.error("❌ [Webhook] Error details:", err);
            response.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }

        // Handle the event
        console.log("🔄 [Webhook] Processing event type:", event.type);

        switch (event.type) {
            case "account.updated": {
                const account = event.data.object;
                console.log(
                    "🔄 [Webhook] Account updated event received for account:",
                    account.id
                );
                console.log("🔄 [Webhook] Account details:", {
                    charges_enabled: account.charges_enabled,
                    details_submitted: account.details_submitted,
                    requirements: account.requirements,
                    country: account.country,
                    business_type: account.business_type,
                });
                // Prefer resolving the user via Stripe account metadata
                const uidFromMetadata = account?.metadata?.firebaseUID;
                if (uidFromMetadata) {
                    const uid = uidFromMetadata;
                    console.log("✅ [Webhook] Resolved UID from Stripe metadata:", uid);

                    // Update the status snapshot
                    console.log("🔄 [Webhook] Calculating new status...");
                    const status = {
                        hasConnectAccount: true,
                        accountId: account.id,
                        isEnabledForCharges: Boolean(account.charges_enabled),
                        detailsSubmitted: Boolean(account.details_submitted),
                        requirementsDue: Array.isArray(
                            account.requirements?.currently_due
                        )
                            ? account.requirements.currently_due
                            : [],
                        isFullyActive: Boolean(
                            account.charges_enabled &&
                                account.details_submitted &&
                                (!account.requirements?.currently_due ||
                                    account.requirements.currently_due.length === 0)
                        ),
                    };

                    console.log("🔄 [Webhook] Calculated status:", status);
                    console.log("🔄 [Webhook] Updating Firestore for user:", uid);

                    try {
                        await db.doc(`users/${uid}/private/data`).set(
                            {
                                stripeConnectId: account.id,
                                stripeConnectStatus: {
                                    accountId: status.accountId,
                                    isEnabledForCharges: status.isEnabledForCharges,
                                    detailsSubmitted: status.detailsSubmitted,
                                    requirementsDue: status.requirementsDue,
                                    isFullyActive: status.isFullyActive,
                                    updatedAt: FieldValue.serverTimestamp(),
                                },
                            },
                            { merge: true }
                        );

                        console.log(
                            "✅ [Webhook] Successfully updated Connect status for user",
                            uid,
                            ":",
                            status
                        );
                    } catch (firestoreError) {
                        console.error(
                            "❌ [Webhook] Failed to update Firestore:",
                            firestoreError
                        );
                        throw firestoreError;
                    }
                } else {
                    console.log(
                        "🔄 [Webhook] No UID in Stripe metadata; falling back to collectionGroup lookup by Connect ID..."
                    );
                    // Fallback: query the user's private subcollection where we store stripeConnectId
                    const cgQuery = await db
                        .collectionGroup("private")
                        .where("stripeConnectId", "==", account.id)
                        .limit(1)
                        .get();

                    console.log(
                        "🔄 [Webhook] CollectionGroup query - empty:",
                        cgQuery.empty
                    );
                    console.log(
                        "🔄 [Webhook] CollectionGroup query - size:",
                        cgQuery.size
                    );

                    if (!cgQuery.empty) {
                        const dataDoc = cgQuery.docs[0];
                        const userDocRef = dataDoc.ref.parent.parent; // users/{uid}
                        const uid = userDocRef?.id;
                        console.log(
                            "✅ [Webhook] Found user via collectionGroup with UID:",
                            uid
                        );

                        const status = {
                            hasConnectAccount: true,
                            accountId: account.id,
                            isEnabledForCharges: Boolean(account.charges_enabled),
                            detailsSubmitted: Boolean(account.details_submitted),
                            requirementsDue: Array.isArray(
                                account.requirements?.currently_due
                            )
                                ? account.requirements.currently_due
                                : [],
                            isFullyActive: Boolean(
                                account.charges_enabled &&
                                    account.details_submitted &&
                                    (!account.requirements?.currently_due ||
                                        account.requirements.currently_due.length === 0)
                            ),
                        };

                        try {
                            await db.doc(`users/${uid}/private/data`).set(
                                {
                                    stripeConnectStatus: {
                                        accountId: status.accountId,
                                        isEnabledForCharges: status.isEnabledForCharges,
                                        detailsSubmitted: status.detailsSubmitted,
                                        requirementsDue: status.requirementsDue,
                                        isFullyActive: status.isFullyActive,
                                        updatedAt: FieldValue.serverTimestamp(),
                                    },
                                },
                                { merge: true }
                            );

                            console.log(
                                "✅ [Webhook] Successfully updated Connect status for user",
                                uid,
                                ":",
                                status
                            );
                        } catch (firestoreError) {
                            console.error(
                                "❌ [Webhook] Failed to update Firestore:",
                                firestoreError
                            );
                            throw firestoreError;
                        }
                    } else {
                        console.log(
                            "⚠️ [Webhook] No user found for Connect account ID:",
                            account.id
                        );
                        console.log(
                            "⚠️ [Webhook] Ensure account.metadata.firebaseUID is set when creating accounts."
                        );
                    }
                }
                break;
            }
            default:
                console.log("🔄 [Webhook] Unhandled event type:", event.type);
                console.log(
                    "🔄 [Webhook] Event data:",
                    JSON.stringify(event.data, null, 2)
                );
        }

        console.log("✅ [Webhook] Sending success response");
        response.json({ received: true });
        console.log("✅ [Webhook] Webhook processing completed successfully");
    }
);

// Simple health check endpoint for webhook debugging
export const webhookHealthCheck = onRequest(async (request, response) => {
    console.log("🔄 [HealthCheck] Health check request received");
    console.log("🔄 [HealthCheck] Method:", request.method);
    console.log("🔄 [HealthCheck] URL:", request.url);
    console.log("🔄 [HealthCheck] Headers:", JSON.stringify(request.headers, null, 2));

    response.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "Webhook function is running and accessible",
    });
});
