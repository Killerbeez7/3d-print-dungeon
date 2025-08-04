import {
    generateRandomUsername,
    generateUUIDUsername,
} from "./utils/generateUsername.js";
import {
    validateRequiredFields,
    validateEmail,
    validatePassword,
    handleError,
} from "./utils/validateFields.js";
import { requireAdmin, requireAuth } from "./utils/checkPermisions.js";

// Auth-specific exports
export {
    // Username generation (for auto-generated usernames)
    generateRandomUsername,
    generateUUIDUsername,
    
    // Validation functions (for auth endpoints)
    validateRequiredFields,
    validateEmail,
    validatePassword,
    handleError,
    
    // Permission checks (for auth endpoints)
    requireAdmin,
    requireAuth,
};
