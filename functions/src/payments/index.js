import { onCall, HttpsError } from "firebase-functions/v2/https";
import { FieldValue } from "firebase-admin/firestore";
import {
    stripeSecretKey,
    getStripe,
    getOrCreateStripeCustomerId,
    db,
} from "../shared/config.js";
import { requireAuth, validateRequiredFields, handleError } from "../shared/utils.js";

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
            handleError(error, "getSellerSales");
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

            await db.collection("users").doc(uid).update({
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
