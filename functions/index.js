import "./src/shared/globalOptions.js";
import * as payments from "./src/payments/index.js";
import * as analytics from "./src/analytics/index.js";
import * as auth from "./src/auth/index.js";
import * as models from "./src/models/index.js";
import * as user from "./src/user/index.js";

// Auth functions
export const {
    setUserRole,
    checkUsernameAvailability,
    checkEmailAvailability,
    createValidatedUser,
    ensureUserDocument,
} = auth;

// Payment functions
export const {
    createStripeCustomer,
    createPaymentIntent,
    handlePaymentSuccess,
    getUserPurchases,
    getSellerSales,
    createConnectAccount,
    createAccountLink,
    checkConnectStatus,
    stripeWebhook,
    webhookHealthCheck,
} = payments;

// Analytics functions
export const {
    trackModelView,
    processViewAnalytics,
    getModelViewCount,
    cleanupViewBuffer,
} = analytics;

export const { createArtistProfile, updateArtistProfile, deleteArtistProfile } = user;
export const { toggleFollow, getFollowStatus } = user;

// Models functions
export const { onLikeCreated, onLikeDeleted, deleteModel, getModelDownloadUrl } = models;
