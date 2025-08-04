import { refreshIdToken } from "./refreshIdToken";

import { getHighResPhotoURL } from "./imageUtils";

import {
    validateUsername,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    type ValidationResult,
    type ValidationContext
} from "./inputValidators";

import {
    isUsernameAvailableInDB,
    isEmailAvailableInDB
} from "./checkAvailability";

import {
    handleAuthError,
    mapFirebaseError,
    formatErrorForDisplay,
    isRecoverableError,
    type AuthError
} from "./errorHandling";


export {
    // Validation
    validateUsername,
    validateEmail,
    validatePassword,
    validateConfirmPassword,

    // Availability checking
    isUsernameAvailableInDB,
    isEmailAvailableInDB,

    // Error handling
    handleAuthError,
    mapFirebaseError,
    formatErrorForDisplay,
    isRecoverableError,

    // Token management
    refreshIdToken,

    // Image utilities
    getHighResPhotoURL,

    // Types
    type ValidationResult,
    type ValidationContext,
    type AuthError
};






