export interface AuthError {
    type: AuthErrorType;
    message: string;
    field?: string;
    code?: string;
    retryAfter?: number;
}

export enum AuthErrorType {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    USERNAME_TAKEN = "USERNAME_TAKEN",
    USER_EXISTS = "USER_EXISTS",
    WEAK_PASSWORD = "WEAK_PASSWORD",
    RATE_LIMITED = "RATE_LIMITED",
    SERVER_ERROR = "SERVER_ERROR",
    NETWORK_ERROR = "NETWORK_ERROR",
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
    EMAIL_ALREADY_IN_USE = "EMAIL_ALREADY_IN_USE",
    TOO_MANY_REQUESTS = "TOO_MANY_REQUESTS"
}


// maps firebase auth errors to user-friendly messages
export const mapFirebaseError = (error: unknown): AuthError => {
    const code = (error as { code?: string })?.code || "unknown";

    switch (code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
        case "auth/invalid-credential":
        case "auth/invalid-login-credentials":
            return {
                type: AuthErrorType.INVALID_CREDENTIALS,
                message: "Invalid email or password",
                code,
                field: "email"
            };

        case "auth/email-already-in-use":
            return {
                type: AuthErrorType.EMAIL_ALREADY_IN_USE,
                message: "An account with this email already exists",
                code,
                field: "email"
            };

        case "auth/weak-password":
            return {
                type: AuthErrorType.WEAK_PASSWORD,
                message: "Password is too weak. Please choose a stronger password",
                code,
                field: "password"
            };

        case "auth/too-many-requests":
            return {
                type: AuthErrorType.TOO_MANY_REQUESTS,
                message: "Too many failed attempts. Please try again later",
                code,
                retryAfter: 60
            };

        case "auth/network-request-failed":
            return {
                type: AuthErrorType.NETWORK_ERROR,
                message: "Network error. Please check your connection and try again",
                code
            };

        case "auth/operation-not-allowed":
            return {
                type: AuthErrorType.SERVER_ERROR,
                message: "This sign-in method is not enabled",
                code
            };

        case "auth/invalid-email":
            return {
                type: AuthErrorType.VALIDATION_ERROR,
                message: "Please enter a valid email address",
                code,
                field: "email"
            };

        case "auth/user-disabled":
            return {
                type: AuthErrorType.SERVER_ERROR,
                message: "This account has been disabled",
                code
            };

        case "auth/requires-recent-login":
            return {
                type: AuthErrorType.SERVER_ERROR,
                message: "Please sign in again to continue",
                code
            };

        default:
            return {
                type: AuthErrorType.SERVER_ERROR,
                message: "An unexpected error occurred. Please try again",
                code
            };
    }
};

// handles authentication errors with consistent formatting
export const handleAuthError = (error: unknown, context: string = "authentication"): AuthError => {
    // Avoid noisy console errors in production; keep lightweight trace in dev
    if ((import.meta as { env: { DEV: boolean } })?.env?.DEV) {
        console.debug(`${context} error:`, error);
    }

    // If it's already an AuthError, return it
    if (error && typeof error === "object" && "type" in error) {
        return error as AuthError;
    }

    // If it's a Firebase error, map it
    if (error && typeof error === "object" && "code" in error) {
        return mapFirebaseError(error);
    }

    // If it's a string, create a generic error
    if (typeof error === "string") {
        return {
            type: AuthErrorType.SERVER_ERROR,
            message: error,
            code: "custom"
        };
    }

    // Default fallback
    return {
        type: AuthErrorType.SERVER_ERROR,
        message: "An unexpected error occurred. Please try again",
        code: "unknown"
    };
};

// provides actionable solutions for common errors
export const getErrorSolution = (error: AuthError): string | null => {
    switch (error.type) {
        case AuthErrorType.INVALID_CREDENTIALS:
            return "Please check your email and password and try again";

        case AuthErrorType.WEAK_PASSWORD:
            return "Try using a password with at least 8 characters, including uppercase, lowercase, and numbers";

        case AuthErrorType.EMAIL_ALREADY_IN_USE:
            return "Try signing in instead, or use a different email address";

        case AuthErrorType.TOO_MANY_REQUESTS:
            return `Please wait ${error.retryAfter || 60} seconds before trying again`;

        case AuthErrorType.NETWORK_ERROR:
            return "Check your internet connection and try again";

        case AuthErrorType.USERNAME_TAKEN:
            return "Please choose a different username";

        default:
            return null;
    }
};

// checks if an error is recoverable (user can fix it)
export const isRecoverableError = (error: AuthError): boolean => {
    return [
        AuthErrorType.VALIDATION_ERROR,
        AuthErrorType.INVALID_CREDENTIALS,
        AuthErrorType.WEAK_PASSWORD,
        AuthErrorType.USERNAME_TAKEN
    ].includes(error.type);
};

// formats error for display with solution if available
export const formatErrorForDisplay = (error: AuthError): string => {
    const solution = getErrorSolution(error);
    if (solution) {
        return `${error.message}. ${solution}`;
    }
    return error.message;
}; 