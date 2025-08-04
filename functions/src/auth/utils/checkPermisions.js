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
        throw new HttpsError(
            "permission-denied",
            "Only admins can perform this action."
        );
    }
    console.log("Admin authenticated");
    return auth;
};
