import { httpsCallable } from "firebase/functions";
import { functions, auth } from "../config/firebase";

class PaymentService {
    constructor() {
        this.retryAttempts = new Map(); // Track retry attempts per function
        this.maxRetries = 2; // Reduce from 3 to 2
        this.retryDelay = 1000; // 1 second delay between retries
    }

    /**
     * Enhanced retry wrapper with exponential backoff and attempt tracking
     */
    async withRetry(operation, operationName) {
        let lastError;

        for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
            try {
                console.log(`🔄 ${operationName} - Attempt ${attempt + 1}/${this.maxRetries + 1}`);
                
                if (attempt > 0) {
                    const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log(`⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                const result = await operation();
                
                if (attempt > 0) {
                    console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
                }
                
                return result;
            } catch (error) {
                lastError = error;
                console.error(`❌ ${operationName} failed on attempt ${attempt + 1}:`, {
                    message: error.message,
                    code: error.code,
                });

                // Don't retry auth errors or invalid argument errors
                if (error.code === 'unauthenticated' || 
                    error.code === 'permission-denied' ||
                    error.code === 'invalid-argument') {
                    console.log(`🚫 Not retrying ${operationName} due to auth/validation error`);
                    break;
                }

                // Don't retry on last attempt
                if (attempt === this.maxRetries) {
                    console.log(`🚫 Max retries reached for ${operationName}`);
                    break;
                }
            }
        }

        throw lastError;
    }

    async createCustomer() {
        try {
            const createStripeCustomerFunc = httpsCallable(functions, "createStripeCustomer");
            const result = await createStripeCustomerFunc();
            console.log("🔐 Customer created:", result.data);
            return result.data;
        } catch (error) {
            console.error("Error creating customer:", error);
            throw error;
        }
    }

    /**
     * Create payment intent for model purchase
     * @param {string} modelId - The model ID to purchase
     * @param {number} amount - The amount in dollars
     * @param {string} currency - The currency (default: usd)
     */
    async createPaymentIntent(modelId, amount, currency = "usd") {
        return this.withRetry(async () => {
            console.log("💳 Creating payment intent...", { modelId, amount, currency });

            if (!auth.currentUser) {
                throw new Error("User must be logged in to make purchases");
            }

            // Force token refresh before payment
            await auth.currentUser.getIdToken(true);
            
            const createPaymentIntentFunc = httpsCallable(functions, "createPaymentIntent");
            const result = await createPaymentIntentFunc({
                modelId,
                amount,
                currency,
            });

            console.log("✅ Payment intent created successfully");
            return result.data;
        }, "createPaymentIntent");
    }

    /**
     * Create subscription for premium features
     * @param {string} priceId - Stripe price ID
     * @param {string} paymentMethodId - Payment method ID (optional)
     */
    async createSubscription(priceId, paymentMethodId = null) {
        return this.withRetry(async () => {
            if (!auth.currentUser) {
                throw new Error("User must be logged in to subscribe");
            }

            const createSubscriptionFunc = httpsCallable(functions, "createSubscription");
            const result = await createSubscriptionFunc({
                priceId,
                paymentMethodId,
            });

            return result.data;
        }, "createSubscription");
    }

    /**
     * Handle successful payment completion
     * @param {string} paymentIntentId - The payment intent ID
     */
    async handlePaymentSuccess(paymentIntentId) {
        return this.withRetry(async () => {
            console.log("🎉 Handling payment success...", { paymentIntentId });

            if (!auth.currentUser) {
                throw new Error("User must be logged in");
            }

            const handlePaymentSuccessFunc = httpsCallable(functions, "handlePaymentSuccess");
            const result = await handlePaymentSuccessFunc({ paymentIntentId });

            console.log("✅ Payment success handled");
            return result.data;
        }, "handlePaymentSuccess");
    }

    /**
     * Get user's purchase history
     */
    async getUserPurchases() {
        return this.withRetry(async () => {
            console.log("🔐 getUserPurchases - Starting auth check...");
            
            if (!auth.currentUser) {
                throw new Error("User must be logged in to view purchases");
            }

            // Force refresh the ID token to ensure it's valid
            console.log("🔄 Refreshing ID token for purchases...");
            const token = await auth.currentUser.getIdToken(true);
            
            console.log("✅ Token refreshed:", {
                hasToken: !!token,
                uid: auth.currentUser.uid,
                email: auth.currentUser.email?.substring(0, 10) + "...",
            });

            const getUserPurchasesFunc = httpsCallable(functions, "getUserPurchases");
            const result = await getUserPurchasesFunc({});
            
            console.log("✅ getUserPurchases completed successfully");
            return result.data.purchases || [];
        }, "getUserPurchases");
    }

    /**
     * Get seller's sales history
     */
    async getSellerSales() {
        return this.withRetry(async () => {
            if (!auth.currentUser) {
                throw new Error("User must be logged in to view sales");
            }

            const getSellerSalesFunc = httpsCallable(functions, "getSellerSales");
            const result = await getSellerSalesFunc({});
            
            return result.data.sales || [];
        }, "getSellerSales");
    }

    /**
     * Create Stripe Connect account for sellers
     * @param {string} country - Country code (default: US)
     * @param {string} type - Account type (default: express)
     */
    async createConnectAccount(country = "US", type = "express") {
        return this.withRetry(async () => {
            if (!auth.currentUser) {
                throw new Error("User must be logged in to become a seller");
            }

            const createConnectAccountFunc = httpsCallable(functions, "createConnectAccount");
            const result = await createConnectAccountFunc({
                country,
                type,
            });

            return result.data;
        }, "createConnectAccount");
    }

    /**
     * Create account link for seller onboarding
     * @param {string} accountId - Stripe account ID
     * @param {string} refreshUrl - URL to redirect on refresh
     * @param {string} returnUrl - URL to redirect on completion
     */
    async createAccountLink(accountId, refreshUrl, returnUrl) {
        return this.withRetry(async () => {
            if (!auth.currentUser) {
                throw new Error("User must be logged in");
            }

            const createAccountLinkFunc = httpsCallable(functions, "createAccountLink");
            const result = await createAccountLinkFunc({
                accountId,
                refreshUrl,
                returnUrl,
            });

            return result.data;
        }, "createAccountLink");
    }

    /**
     * Format price for display
     * @param {number} amount - Amount in dollars
     * @param {string} currency - Currency code
     */
    formatPrice(amount, currency = "USD") {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency.toUpperCase(),
        }).format(amount);
    }

    /**
     * Validate price input
     * @param {string|number} price - Price to validate
     */
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

    /**
     * Check if user has purchased a model
     * @param {string} modelId - Model ID to check
     * @param {Array} userPurchases - User's purchase array
     */
    hasPurchased(modelId, userPurchases = []) {
        return userPurchases.includes(modelId);
    }
}

export const paymentService = new PaymentService();
