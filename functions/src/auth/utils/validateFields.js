import { HttpsError } from "firebase-functions/v2/https";
import { VALIDATION_RULES } from "./validationRules.js";

// Validation helpers
export const validateRequiredFields = (data, fields) => {
    for (const field of fields) {
        if (!data[field]) {
            throw new HttpsError("invalid-argument", `${field} is required.`);
        }
    }
    console.log("Required fields validated");
};

// Error handling
export const handleError = (error, context = "Unknown operation") => {
    console.error(`Error in ${context}:`, error);
    if (error instanceof HttpsError) {
        throw error;
    }
    throw new HttpsError(
        "internal",
        `Failed to ${context.toLowerCase()}: ${error.message}`
    );
};

export const validateUsername = (username) => {
    if (!username || username.trim().length === 0) {
        return { isValid: false, error: "Username is required" };
    }

    if (username.trim().length < VALIDATION_RULES.username.minLength) {
        return {
            isValid: false,
            error: `Username must be at least ${VALIDATION_RULES.username.minLength} characters long`,
        };
    }

    if (username.length > VALIDATION_RULES.username.maxLength) {
        return {
            isValid: false,
            error: `Username must be less than ${VALIDATION_RULES.username.maxLength} characters`,
        };
    }

    if (!VALIDATION_RULES.username.pattern.test(username)) {
        return {
            isValid: false,
            error: "Username can only contain letters, numbers, hyphens, and underscores",
        };
    }

    if (
        VALIDATION_RULES.username.reserved.some(
            (reserved) => reserved === username.toLowerCase()
        )
    ) {
        return { isValid: false, error: "This username is reserved" };
    }

    return { isValid: true };
};

export const validateEmail = (email) => {
    if (!email || email.trim().length === 0) {
        return { isValid: false, error: "Email is required" };
    }

    if (!VALIDATION_RULES.email.pattern.test(email)) {
        return { isValid: false, error: "Please enter a valid email address" };
    }

    return { isValid: true };
};

export const validatePassword = (password) => {
    if (!password || password.length === 0) {
        return { isValid: false, error: "Password is required" };
    }

    if (password.length < VALIDATION_RULES.password.minLength) {
        return {
            isValid: false,
            error: `Password must be at least ${VALIDATION_RULES.password.minLength} characters long`,
        };
    }

    if (VALIDATION_RULES.password.requireUppercase && !/(?=.*[A-Z])/.test(password)) {
        return {
            isValid: false,
            error: "Password must contain at least one uppercase letter",
        };
    }

    if (VALIDATION_RULES.password.requireLowercase && !/(?=.*[a-z])/.test(password)) {
        return {
            isValid: false,
            error: "Password must contain at least one lowercase letter",
        };
    }

    if (VALIDATION_RULES.password.requireNumber && !/(?=.*\d)/.test(password)) {
        return { isValid: false, error: "Password must contain at least one number" };
    }

    if (
        VALIDATION_RULES.password.requireSpecial &&
        !/(?=.*[!@#$%^&*(),.?":{}|<>])/.test(password)
    ) {
        return {
            isValid: false,
            error: "Password must contain at least one special character",
        };
    }

    return { isValid: true };
};
