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

// Check if username is available
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

// Check if email is available
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
            const now = admin.firestore.Timestamp.now();
            transaction.set(userRef, {
                email: userRecord.email,
                username,
                displayName: "Anonymous",
                photoURL: null,
                authProvider: "password",
                createdAt: now,
                updatedAt: now,
                roles: [],
                profileComplete: false,
                preferences: { emailNotifications: true, theme: "auto" },
                stats: {
                    loginCount: 1,
                    lastLoginAt: now,
                    uploadsCount: 0,
                    likesCount: 0,
                    viewsCount: 0,
                    followers: 0,
                    following: 0,
                },
                isArtist: false,
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

// Ensure user document exists
export const ensureUserDocument = onCall(async ({ auth }) => {
    if (!auth) throw new HttpsError("unauthenticated", "Login required");

    const { uid, token } = auth; // token has email, name, picture, provider_id
    const db = admin.firestore();
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();

    // If user doc already exists just touch the “lastLoginAt” field
    if (userSnap.exists) {
        await userRef.set(
            { lastLoginAt: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true }
        );
        return { created: false };
    }

    // ----- create new document -----
    const displayName = token.name || "Anonymous";
    let username = generateRandomUsername();

    // ensure unique username; fall back to UUID if 10 random attempts fail
    let attempts = 0;
    while (attempts < 10) {
        const q = await db
            .collection("users")
            .where("username", "==", username)
            .limit(1)
            .get();
        if (q.empty) break;
        username = generateRandomUsername();
        attempts++;
    }

    if (attempts >= 10) {
        console.log("Initial random usernames taken - using UUID fallback");
        username = generateUUIDUsername();
    }

    // ----- create user document -----
    const now = admin.firestore.FieldValue.serverTimestamp();
    await userRef.set({
        email: token.email ?? null,
        username,
        displayName,
        photoURL: token.picture ?? null,
        authProvider: token.firebase.sign_in_provider,
        createdAt: now,
        updatedAt: now,
        roles: [],
        profileComplete: false,
        preferences: { emailNotifications: true, theme: "auto" },
        stats: {
            loginCount: 1,
            lastLoginAt: now,
            uploadsCount: 0,
            likesCount: 0,
            viewsCount: 0,
            followers: 0,
            following: 0,
        },
        isArtist: false,
    });

    return { created: true, username };
});

// Password reset functionality (TODO)
// Email verification (TODO)
// Social auth integration (TODO)
