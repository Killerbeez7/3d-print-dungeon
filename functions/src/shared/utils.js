import { HttpsError } from "firebase-functions/v2/https";

// Authentication helpers
export const requireAuth = (request) => {
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    return request.auth;
};

export const requireAdmin = (request) => {
    const auth = requireAuth(request);
    if (auth.token.admin !== true) {
        throw new HttpsError("permission-denied", "Only admins can perform this action.");
    }
    return auth;
};

// Validation helpers
export const validateRequiredFields = (data, fields) => {
    for (const field of fields) {
        if (!data[field]) {
            throw new HttpsError("invalid-argument", `${field} is required.`);
        }
    }
};

// Error handling
export const handleError = (error, context = "Unknown operation") => {
    console.error(`❌ Error in ${context}:`, error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError("internal", `Failed to ${context.toLowerCase()}: ${error.message}`);
};

// Constants
export const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
export const BATCH_SIZE = 100;
export const VIEW_BUFFER_COLLECTION = "viewBuffer";
export const CACHE_TTL = 5 * 60 * 1000; // 5 minutes