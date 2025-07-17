import { getFunctions, httpsCallable, Functions } from "firebase/functions";
import { app } from "@/config/firebaseConfig";
import { auth } from "@/config/firebaseConfig";
import type { Purchase, SellerSale } from "@/features/payment/types/payment";

const functions: Functions = getFunctions(app, "us-central1");

export class PaymentService {
    private maxRetries = 2;
    private retryDelay = 1000;

    private async withRetry<T>(operation: () => Promise<T>, name: string): Promise<T> {
        let lastError: unknown;
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
                    ["unauthenticated", "permission-denied", "invalid-argument"].includes((error as { code?: string })?.code ?? "")
                )
                    break;
            }
        }
        throw lastError;
    }

    private async callWithAuth<T = unknown>(fnName: string, data?: object): Promise<T> {
        try {
            if (!auth.currentUser) {
                throw new Error("User not authenticated. Please log in.");
            }
            console.log("currentUser", auth.currentUser);
            console.log("currentToken", auth.currentUser.getIdToken());
            console.log("refreshing token...");
            await auth.currentUser.getIdToken(true);
            console.log("token refreshed", auth.currentUser);
            console.log("newToken", auth.currentUser.getIdToken());
            const callable = httpsCallable<unknown, T>(functions, fnName);
            const result = await callable(data);
            console.log("result", result);
            return result.data;
        } catch (error) {
            console.error(`❌ [${fnName}] Error:`, (error as Error).message || error);
            throw error;
        }
    }

    async createConnectAccount(): Promise<unknown> {
        return this.withRetry(() => this.callWithAuth("createConnectAccount"), "createConnectAccount");
    }

    async createAccountLink(accountId: string, refreshUrl: string, returnUrl: string): Promise<string> {
        const data = { accountId, refreshUrl, returnUrl };
        const result = await this.withRetry(() => this.callWithAuth<{ url: string }>("createAccountLink", data), "createAccountLink");
        return result.url;
    }

    async createPaymentIntent(modelId: string, amount: number, currency = "usd"): Promise<unknown> {
        return this.withRetry(async () => {
            const fn = httpsCallable<{ modelId: string; amount: number; currency: string }, unknown>(functions, "createPaymentIntent");
            const res = await fn({ modelId, amount, currency });
            return res.data;
        }, "createPaymentIntent");
    }

    async handlePaymentSuccess(paymentIntentId: string): Promise<unknown> {
        return this.withRetry(async () => {
            const fn = httpsCallable<{ paymentIntentId: string }, unknown>(functions, "handlePaymentSuccess");
            const res = await fn({ paymentIntentId });
            return res.data;
        }, "handlePaymentSuccess");
    }

    async getUserPurchases(): Promise<Purchase[]> {
        return this.withRetry(async () => {
            const fn = httpsCallable<undefined, { purchases?: Purchase[] }>(functions, "getUserPurchases");
            const res = await fn();
            return res.data.purchases || [];
        }, "getUserPurchases");
    }

    async getSellerSales(): Promise<SellerSale[]> {
        return this.withRetry(async () => {
            const fn = httpsCallable<undefined, { sales?: SellerSale[] }>(functions, "getSellerSales");
            const res = await fn();
            return res.data.sales || [];
        }, "getSellerSales");
    }

    formatPrice(amount: number, currency = "USD"): string {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    }

    validatePrice(price: string | number): number {
        const numPrice = typeof price === "number" ? price : parseFloat(price);
        if (isNaN(numPrice) || numPrice < 0) {
            throw new Error("Price must be a valid positive number");
        }
        if (numPrice > 999999) {
            throw new Error("Price cannot exceed $999,999");
        }
        return numPrice;
    }

    hasPurchased(modelId: string, purchases: Purchase[] = []): boolean {
        return purchases.some((item) => item.modelId === modelId);
    }
}

export const paymentService = new PaymentService();
