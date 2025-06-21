import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/config/firebase"; // your initialized Firebase app
// import { functions } from "@/config/firebase";
// import { httpsCallable } from "firebase/functions";
import { auth } from "@/config/firebase";
const functions = getFunctions(app, "us-central1"); // or "europe-west1" if that's what you deployed to


class PaymentService {
    constructor() {
        this.maxRetries = 2;
        this.retryDelay = 1000;
    }

    async withRetry(operation, name) {
        let lastError;
        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1);
                    console.log(`Retrying ${name} in ${delay}ms...`);
                    await new Promise((r) => setTimeout(r, delay));
                }
                const result = await operation();
                return result;
            } catch (error) {
                lastError = error;
                if (
                    ["unauthenticated", "permission-denied", "invalid-argument"].includes(
                        error?.code
                    )
                )
                    break;
            }
        }
        throw lastError;
    }


    async callWithAuth(fnName, data) {
        try {
            if (!auth.currentUser) {
                throw new Error("User not authenticated. Please log in.");
            }
            console.log("currentUser", auth.currentUser);
            console.log("currentToken", auth.currentUser.getIdToken());
            console.log("refreshing token...");
            
            // Force a token refresh to ensure it's not stale.
            await auth.currentUser.getIdToken(true);
            console.log("token refreshed", auth.currentUser);
            console.log("newToken", auth.currentUser.getIdToken());
            
            const callable = httpsCallable(functions, fnName);
            const result = await callable(data);
            console.log("result", result);
            
            return result.data;
        } catch (error) {
            console.error(`❌ [${fnName}] Error:`, error.message || error);
            throw error;
        }
    }

    async createConnectAccount() {
        return this.withRetry(
            () => this.callWithAuth("createConnectAccount"),
            "createConnectAccount"
        );
    }

    async createAccountLink(accountId, refreshUrl, returnUrl) {
        const data = { accountId, refreshUrl, returnUrl };
        const result = await this.withRetry(
            () => this.callWithAuth("createAccountLink", data),
            "createAccountLink"
        );
        return result.url;
    }

    // async createStripeCustomer() {
    //     return this.withRetry(async () => {
    //         const fn = httpsCallable(functions, "createStripeCustomer");
    //         const res = await fn();
    //         return res.data;
    //     }, "createStripeCustomer");
    // }

    async createPaymentIntent(modelId, amount, currency = "usd") {
        return this.withRetry(async () => {
            const fn = httpsCallable(functions, "createPaymentIntent");
            const res = await fn({ modelId, amount, currency });
            return res.data;
        }, "createPaymentIntent");
    }

    // async createSubscription(priceId, paymentMethodId = null) {
    //     return this.withRetry(async () => {
    //         const fn = httpsCallable(functions, "createSubscription");
    //         const res = await fn({ priceId, paymentMethodId });
    //         return res.data;
    //     }, "createSubscription");
    // }

    async handlePaymentSuccess(paymentIntentId) {
        return this.withRetry(async () => {
            const fn = httpsCallable(functions, "handlePaymentSuccess");
            const res = await fn({ paymentIntentId });
            return res.data;
        }, "handlePaymentSuccess");
    }

    async getUserPurchases() {
        return this.withRetry(async () => {
            const fn = httpsCallable(functions, "getUserPurchases");
            const res = await fn();
            return res.data.purchases || [];
        }, "getUserPurchases");
    }

    async getSellerSales() {
        return this.withRetry(async () => {
            const fn = httpsCallable(functions, "getSellerSales");
            const res = await fn();
            return res.data.sales || [];
        }, "getSellerSales");
    }

    formatPrice(amount, currency = "USD") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    }

    validatePrice(price) {
        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice < 0) {
            throw new Error("Price must be a valid positive number");
        }
        if (numPrice > 999999) {
            throw new Error("Price cannot exceed $999,999");
        }
        return numPrice;
    }

    hasPurchased(modelId, purchases = []) {
        return purchases.some((item) => item.modelId === modelId);
    }
}

export const paymentService = new PaymentService();
