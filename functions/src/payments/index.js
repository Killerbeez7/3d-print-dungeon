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

// Create payment intent. The price and currency always come from the model
// document, never from the buyer's browser.
export const createPaymentIntent = onCall(
    { secrets: [stripeSecretKey], cors: true, invoker: "public" },
    async (request) => {
        try {
            const { uid, token } = requireAuth(request);
            const { modelId } = request.data;

            validateRequiredFields(request.data, ["modelId"]);

            const modelDoc = await db.collection("models").doc(modelId).get();
            if (!modelDoc.exists) {
                throw new HttpsError("not-found", "Model not found.");
            }
            const modelData = modelDoc.data();

            const price = Number(modelData.price);
            if (!modelData.isPaid || !Number.isFinite(price) || price <= 0) {
                throw new HttpsError("failed-precondition", "This model is not for sale.");
            }
            if (modelData.uploaderId === uid) {
                throw new HttpsError("failed-precondition", "You can't buy your own model.");
            }
            const owned = await db.doc(`users/${uid}/purchases/${modelId}`).get();
            if (owned.exists) {
                throw new HttpsError("already-exists", "You already own this model.");
            }

            const currency = String(modelData.currency || "usd").toLowerCase();
            const amountCents = Math.round(price * 100);

            const customerId = await getOrCreateStripeCustomerId(uid, token);
            const stripe = getStripe();

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountCents,
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
                amount: price,
                amountCents,
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

// Records a succeeded payment as a purchase. Safe to call more than once for
// the same payment (from the browser and from the webhook): the purchase is
// keyed by the payment intent id and written in a transaction.
const recordPurchase = async (paymentIntent) => {
    const paymentRef = db.collection("paymentIntents").doc(paymentIntent.id);
    const purchaseRef = db.collection("purchases").doc(paymentIntent.id);

    return db.runTransaction(async (tx) => {
        const [paymentDoc, purchaseDoc] = await Promise.all([
            tx.get(paymentRef),
            tx.get(purchaseRef),
        ]);
        if (!paymentDoc.exists) {
            throw new HttpsError("not-found", "Payment intent not found.");
        }
        if (purchaseDoc.exists) {
            return purchaseRef.id;
        }

        const paymentData = paymentDoc.data();
        const expectedCents =
            paymentData.amountCents ?? Math.round(paymentData.amount * 100);
        if (
            paymentIntent.status !== "succeeded" ||
            paymentIntent.amount !== expectedCents ||
            paymentIntent.currency !== paymentData.currency ||
            paymentIntent.metadata?.modelId !== paymentData.modelId
        ) {
            throw new HttpsError("failed-precondition", "Payment does not match the order.");
        }

        tx.set(purchaseRef, {
            ...paymentData,
            id: purchaseRef.id,
            status: "completed",
            purchasedAt: FieldValue.serverTimestamp(),
        });
        tx.set(
            db.doc(`users/${paymentData.buyerId}/purchases/${paymentData.modelId}`),
            {
                modelId: paymentData.modelId,
                purchaseId: purchaseRef.id,
                purchasedAt: FieldValue.serverTimestamp(),
                pricePaidCents: expectedCents,
                currency: paymentData.currency,
            },
            { merge: true }
        );
        tx.update(db.collection("models").doc(paymentData.modelId), {
            purchaseCount: FieldValue.increment(1),
            totalRevenue: FieldValue.increment(paymentData.amount),
        });
        tx.update(paymentRef, {
            status: "completed",
            completedAt: FieldValue.serverTimestamp(),
        });
        return purchaseRef.id;
    });
};

// Handle payment success (called by the buyer's browser after checkout)
export const handlePaymentSuccess = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            const { uid } = requireAuth(request);
            const { paymentIntentId } = request.data;

            validateRequiredFields(request.data, ["paymentIntentId"]);

            const paymentDoc = await db
                .collection("paymentIntents")
                .doc(paymentIntentId)
                .get();
            if (!paymentDoc.exists) {
                throw new HttpsError("not-found", "Payment intent not found.");
            }
            if (paymentDoc.data().buyerId !== uid) {
                throw new HttpsError("permission-denied", "This payment belongs to another account.");
            }

            const stripe = getStripe();
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== "succeeded") {
                throw new HttpsError("failed-precondition", "Payment not completed.");
            }

            const purchaseId = await recordPurchase(paymentIntent);
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

// Return URLs must point back at this site.
const isOwnSiteUrl = (value) => {
    try {
        const { protocol, hostname } = new URL(value);
        if (hostname === "localhost") return true;
        return (
            protocol === "https:" &&
            (hostname === "printdungeon.com" ||
                hostname === "www.printdungeon.com" ||
                hostname === "print-dungeon-3d.web.app" ||
                hostname === "print-dungeon-3d.firebaseapp.com" ||
                (hostname.startsWith("print-dungeon-3d--") && hostname.endsWith(".web.app")))
        );
    } catch {
        return false;
    }
};

// Create account link for the caller's own Connect account
export const createAccountLink = onCall(
    { secrets: [stripeSecretKey], invoker: "public" },
    async (request) => {
        try {
            const { uid } = requireAuth(request);
            const { refreshUrl, returnUrl } = request.data;

            if (!isOwnSiteUrl(refreshUrl) || !isOwnSiteUrl(returnUrl)) {
                throw new HttpsError("invalid-argument", "Invalid return address.");
            }

            const privateDoc = await db.doc(`users/${uid}/private/data`).get();
            const accountId = privateDoc.data()?.stripeConnectId;
            if (!accountId) {
                throw new HttpsError("failed-precondition", "No payout account yet.");
            }

            const stripe = getStripe();
            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: refreshUrl,
                return_url: returnUrl,
                type: "account_onboarding",
            });

            return { url: accountLink.url };
        } catch (error) {
            handleError(error, "createAccountLink");
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
            console.log("✅ [createConnectAccount] Authenticated:", { uid });

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
        const sig = request.headers["stripe-signature"];
        const endpointSecret = stripeWebhookSecret.value();


        let event;

        try {
            const stripe = getStripe();
            console.log("🔄 [Webhook] Constructing event from raw body...");
            event = stripe.webhooks.constructEvent(request.rawBody, sig, endpointSecret);
            console.log("✅ [Webhook] Event received:", { type: event.type, id: event.id });
        } catch (err) {
            console.error("❌ [Webhook] Signature verification failed:", err.message);
            response.status(400).send("Webhook signature verification failed");
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
            case "payment_intent.succeeded": {
                // Backup for buyers who close the tab before the browser
                // reports the payment; recordPurchase ignores repeats.
                const paymentIntent = event.data.object;
                if (paymentIntent.metadata?.modelId) {
                    try {
                        await recordPurchase(paymentIntent);
                    } catch (err) {
                        console.error("❌ [Webhook] Could not record purchase:", {
                            paymentIntentId: paymentIntent.id,
                            code: err.code ?? err.message,
                        });
                    }
                }
                break;
            }
            default:
                console.log("🔄 [Webhook] Unhandled event type:", event.type);
        }

        console.log("✅ [Webhook] Sending success response");
        response.json({ received: true });
        console.log("✅ [Webhook] Webhook processing completed successfully");
    }
);

// Simple health check endpoint for webhook debugging
export const webhookHealthCheck = onRequest(async (_request, response) => {
    response.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        message: "Webhook function is running and accessible",
    });
});
