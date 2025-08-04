import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {
    requireAdmin,
    generateRandomUsername,
    generateUUIDUsername,
    validateRequiredFields,
    validateEmail,
    validatePassword,
} from "./utils.js";

// Set user role claims (admin only)
export const setUserRole = onCall(async (request) => {
    try {
        const { data } = request;
        console.log("setUserRole called, auth:", request.auth);

        // Require admin authentication
        requireAdmin(request);

        // Validate input
        const { uid, role, enable } = data || {};
        if (
            typeof uid !== "string" ||
            typeof role !== "string" ||
            typeof enable !== "boolean"
        ) {
            throw new HttpsError(
                "invalid-argument",
                "data must be { uid, role: string, enable: boolean }"
            );
        }

        // Get current claims
        const user = await admin.auth().getUser(uid);
        const claims = { ...user.customClaims };

        if (enable) {
            claims[role] = true;
        } else {
            delete claims[role];
        }

        await admin.auth().setCustomUserClaims(uid, claims);

        // Mirror roles to firestore (for display/search)
        const enabledRoles = Object.keys(claims).filter((k) => claims[k] === true);
        const ref = admin.firestore().doc(`users/${uid}`);
        await ref.set(
            {
                roles: enabledRoles,
            },
            { merge: true }
        );

        return { status: "ok" };
    } catch (err) {
        console.error("setUserRole INTERNAL ERROR:", err);
        if (err instanceof HttpsError) {
            throw err;
        }
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});

export const checkUsernameAvailability = onCall(async (request) => {
    try {
        const { data } = request;
        console.log("checkUsernameAvailability called");

        // Log auth status for debugging
        if (request.auth) {
            console.log("Authenticated user:", request.auth.uid);
        } else {
            console.log("No authentication (emulator mode)");
        }

        // Validate input
        validateRequiredFields(data, ["username"]);
        const { username } = data;

        if (typeof username !== "string") {
            throw new HttpsError("invalid-argument", "data must be { username: string }");
        }

        // Only check availability - let UI handle input validation
        // Check if username exists in Firestore
        const usersRef = admin.firestore().collection("users");
        const usernameQuery = usersRef.where("username", "==", username).limit(1);
        const snapshot = await usernameQuery.get();

        console.log(
            `Username "${username}" availability: ${
                snapshot.empty ? "AVAILABLE" : "TAKEN"
            }`
        );

        return {
            available: snapshot.empty,
            username: username,
        };
    } catch (err) {
        console.error("checkUsernameAvailability INTERNAL ERROR:", err);
        if (err instanceof HttpsError) {
            throw err;
        }
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});

export const checkEmailAvailability = onCall(async (request) => {
    try {
        const { data } = request;
        console.log("checkEmailAvailability called");

        // Log auth status for debugging
        if (request.auth) {
            console.log("Authenticated user:", request.auth.uid);
        } else {
            console.log("No authentication (emulator mode)");
        }

        // Validate input
        validateRequiredFields(data, ["email"]);
        const { email } = data;

        if (typeof email !== "string") {
            throw new HttpsError("invalid-argument", "data must be { email: string }");
        }

        // Validate email format first
        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            return {
                available: false,
                email: email,
                error: emailValidation.error,
            };
        }

        // Check if email exists in Firebase Auth
        try {
            await admin.auth().getUserByEmail(email);
            console.log(`Email "${email}" availability: TAKEN (Firebase Auth)`);
            return {
                available: false,
                email: email,
                error: "Email is already registered",
            };
        } catch (error) {
            // If user not found, email is available
            if (error.code === "auth/user-not-found") {
                console.log(`Email "${email}" availability: AVAILABLE`);
                return {
                    available: true,
                    email: email,
                };
            }
            // Re-throw other errors
            throw error;
        }
    } catch (err) {
        console.error("checkEmailAvailability INTERNAL ERROR:", err);
        if (err instanceof HttpsError) {
            throw err;
        }
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});

// Validate user input and create user in Firebase Auth
export const createValidatedUser = onCall(async (request) => {
    try {
        const { data } = request;
        console.log("createValidatedUser called");
        console.log("data:", data);

        // Validate input
        validateRequiredFields(data, ["email", "password"]);
        const { email, password } = data;

        // Backend validation (security measure)
        if (typeof email !== "string" || typeof password !== "string") {
            throw new HttpsError("invalid-argument", "Invalid data types");
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.isValid) {
            throw new HttpsError("invalid-argument", emailValidation.error);
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new HttpsError("invalid-argument", passwordValidation.error);
        }

        // Create user in Firebase Auth
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: "Anonymous",
        });

        // Atomic transaction: Create user document with auto-generated username
        const db = admin.firestore();
        const result = await db.runTransaction(async (transaction) => {
            // Generate unique username
            let username = generateRandomUsername();
            let attempts = 0;
            const maxAttempts = 10;

            // Ensure username uniqueness
            while (attempts < maxAttempts) {
                const usernameQuery = db
                    .collection("users")
                    .where("username", "==", username)
                    .limit(1);
                const snapshot = await usernameQuery.get();

                if (snapshot.empty) {
                    break; // Username is unique
                }

                username = generateRandomUsername();
                attempts++;
            }

            if (attempts >= maxAttempts) {
                // Add more randomness to ensure uniqueness
                console.log("Initial attempts failed, using UUID fallback...");

                // Final fallback with UUID-like approach
                username = generateUUIDUsername();
                console.log("UUID-based username generated as fallback:", username);
            }

            // Create user document
            const userRef = db.collection("users").doc(userRecord.uid);
            transaction.set(userRef, {
                email: userRecord.email,
                username: username,
                displayName: username, // Use auto-generated username as displayName
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
                roles: [],
            });

            return {
                success: true,
                uid: userRecord.uid,
                username: username,
                message: "User created successfully",
            };
        });

        return result;
    } catch (err) {
        console.error("createValidatedUser INTERNAL ERROR:", err);
        if (err instanceof HttpsError) {
            throw err;
        }
        throw new HttpsError("internal", err.message || "Unknown error");
    }
});

// Password reset functionality (TODO)
// Email verification (TODO)
// Social auth integration (TODO)
