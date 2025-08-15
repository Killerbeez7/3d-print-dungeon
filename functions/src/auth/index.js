import { onCall, HttpsError } from "firebase-functions/v2/https";
import admin from "firebase-admin";
import {
    requireAdmin,
    generateUsername,
    generateRandomUsername,
    generateUUIDUsername,
    validateRequiredFields,
    validateEmail,
    validatePassword,
    handleError,
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

        // Mirror roles to users/{uid}/privateProfile/profile (for display/search in admin)
        const enabledRoles = Object.keys(claims).filter((k) => claims[k] === true);
        const ref = admin.firestore().doc(`users/${uid}/private/data`);
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

// Update username with registry transaction
export const updateUsername = onCall(async (request) => {
    try {
        const { auth, data } = request;
        if (!auth) throw new HttpsError("unauthenticated", "Login required");
        validateRequiredFields(data || {}, ["username"]);
        const newUsernameRaw = String(data.username || "");
        const newUsername = newUsernameRaw.trim();

        // Basic validation
        const { validateUsername } = await import("./utils/validateFields.js");
        const usernameValidation = validateUsername(newUsername);
        if (!usernameValidation.isValid) {
            throw new HttpsError("invalid-argument", usernameValidation.error);
        }

        const db = admin.firestore();
        const uid = auth.uid;
        const now = admin.firestore.FieldValue.serverTimestamp();

        await db.runTransaction(async (tx) => {
            const publicRef = db.doc(`users/${uid}/public/data`);
            const publicSnap = await tx.get(publicRef);
            if (!publicSnap.exists) {
                throw new HttpsError("failed-precondition", "Public profile not found");
            }
            const publicData = publicSnap.data() || {};
            const oldUsername = (publicData.username || "").toString();

            const newKey = newUsername.toLowerCase();
            const newRegRef = db.doc(`usernames/${newKey}`);
            const newRegSnap = await tx.get(newRegRef);
            if (newRegSnap.exists && newRegSnap.data()?.uid !== uid) {
                throw new HttpsError("already-exists", "Username is already taken");
            }

            // Reserve/assign new
            tx.set(newRegRef, { uid, updatedAt: now }, { merge: true });
            // Update public profile
            tx.set(
                publicRef,
                { username: newUsername, lastActiveAt: now },
                { merge: true }
            );

            // Cleanup old registry if changed
            const oldKey = oldUsername.toLowerCase();
            if (oldKey && oldKey !== newKey) {
                const oldRef = db.doc(`usernames/${oldKey}`);
                const oldSnap = await tx.get(oldRef);
                if (oldSnap.exists && oldSnap.data()?.uid === uid) {
                    tx.delete(oldRef);
                }
            }
        });

        return { success: true, username: newUsername };
    } catch (err) {
        handleError(err, "Update Username");
    }
});

// Check if username is available (checks usernames registry and public profiles)
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

        const db = admin.firestore();
        const key = username.toLowerCase();
        const regSnap = await db.doc(`usernames/${key}`).get();
        let isTaken = regSnap.exists;
        // Backward safety: also check existing public profiles
        if (!isTaken) {
            const cg = db
                .collectionGroup("public")
                .where("username", "==", username)
                .limit(1);
            const snap = await cg.get();
            isTaken = !snap.empty;
        }
        console.log(
            `Username "${username}" availability: ${isTaken ? "TAKEN" : "AVAILABLE"}`
        );

        return {
            available: !isTaken,
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

        const db = admin.firestore();
        const nowField = admin.firestore.FieldValue.serverTimestamp();

        const result = await db.runTransaction(async (tx) => {
            // Start with a random human-friendly username for email sign-ups
            let username = generateRandomUsername();
            let attempts = 0;
            while (attempts < 10) {
                const key = username.toLowerCase();
                const regRef = db.doc(`usernames/${key}`);
                const regSnap = await tx.get(regRef);
                if (!regSnap.exists) {
                    // Reserve
                    tx.set(regRef, { uid: userRecord.uid, createdAt: nowField });
                    break;
                }
                username = generateRandomUsername();
                attempts++;
            }
            if (attempts >= 10) {
                const fallback = generateUUIDUsername();
                const regRef = db.doc(`usernames/${fallback.toLowerCase()}`);
                tx.set(
                    regRef,
                    { uid: userRecord.uid, createdAt: nowField },
                    { merge: true }
                );
                username = fallback;
            }

            // Create user docs atomically
            const rootRef = db.doc(`users/${userRecord.uid}`);
            const publicRef = db.doc(`users/${userRecord.uid}/public/data`);
            const privateRef = db.doc(`users/${userRecord.uid}/private/data`);
            const settingsRef = db.doc(`users/${userRecord.uid}/settings/app`);

            tx.set(
                rootRef,
                { uid: userRecord.uid, createdAt: nowField },
                { merge: true }
            );
            tx.set(publicRef, {
                username,
                displayName: "Anonymous",
                photoURL: null,
                bio: null,
                location: null,
                website: null,
                socialLinks: {},
                stats: {
                    followersCount: 0,
                    followingCount: 0,
                    postsCount: 0,
                    likesCount: 0,
                    viewsCount: 0,
                    uploadsCount: 0,
                },
                isArtist: false,
                isVerified: false,
                isPremium: false,
                artistCategories: [],
                featuredWorks: [],
                joinedAt: nowField,
                lastActiveAt: nowField,
            });
            tx.set(privateRef, {
                uid: userRecord.uid,
                email: userRecord.email ?? null,
                authProvider: "password",
                emailVerified: false,
                roles: ["user"],
                permissions: [],
                profileComplete: false,
                accountStatus: "active",
                createdAt: nowField,
                updatedAt: nowField,
                lastLoginAt: nowField,
                loginCount: 1,
                stripeCustomerId: null,
            });
            tx.set(settingsRef, {
                notifications: {
                    email: true,
                    push: true,
                    marketing: false,
                    newFollowers: true,
                    newLikes: true,
                    newComments: true,
                    modelUpdates: true,
                },
                theme: "auto",
                language: "en",
                timezone: "UTC",
                privacy: {
                    profileVisibility: "public",
                    showEmail: false,
                    showLocation: true,
                    showLastActive: true,
                    allowMessages: "everyone",
                },
                security: {
                    twoFactorEnabled: false,
                    sessionTimeout: 60,
                    loginNotifications: true,
                },
            });

            return {
                success: true,
                uid: userRecord.uid,
                username,
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
    const publicRef = db.doc(`users/${uid}/public/data`);
    const privateRef = db.doc(`users/${uid}/private/data`);
    const settingsRef = db.doc(`users/${uid}/settings/app`);

    const [publicSnap, privateSnap] = await Promise.all([
        publicRef.get(),
        privateRef.get(),
    ]);

    // Helper: Normalize provider-derived profile fields
    const isNonEmptyString = (v) => typeof v === "string" && v.trim() !== "";
    const safeUrl = (u) => {
        try {
            if (!isNonEmptyString(u)) return null;
            // Basic URL validation
            const parsed = new URL(u);
            return parsed.toString();
        } catch {
            return null;
        }
    };
    const deriveAuthProvider = (tkn, userRec) => {
        const providerFromToken = tkn && tkn.firebase && tkn.firebase.sign_in_provider;
        const providerFromRecord =
            Array.isArray(userRec?.providerData) && userRec.providerData.length > 0
                ? userRec.providerData[0].providerId
                : undefined;
        return providerFromToken || providerFromRecord || "password";
    };
    const deriveDisplayName = (tkn, userRec) => {
        return (
            (isNonEmptyString(tkn?.name) && tkn.name) ||
            (isNonEmptyString(userRec?.displayName) && userRec.displayName) ||
            "Anonymous"
        );
    };
    const derivePhotoURL = (tkn, userRec) => {
        const fromToken = safeUrl(tkn?.picture);
        if (fromToken) return fromToken;
        const fromProvider =
            Array.isArray(userRec?.providerData) && userRec.providerData.length > 0
                ? safeUrl(userRec.providerData[0].photoURL)
                : null;
        return fromProvider || null;
    };

    // Fetch user record only if we need extra data not present on token
    const needUserRecord =
        !isNonEmptyString(token?.name) ||
        !isNonEmptyString(token?.picture) ||
        !isNonEmptyString(token?.email);
    const userRecord = needUserRecord
        ? await admin
              .auth()
              .getUser(uid)
              .catch(() => null)
        : null;
    const normalizedDisplayName = deriveDisplayName(token, userRecord);
    const normalizedPhotoURL = derivePhotoURL(token, userRecord);
    const normalizedAuthProvider = deriveAuthProvider(token, userRecord);

    // If new docs already exist, just touch timestamps and ensure username registry exists
    if (publicSnap.exists && privateSnap.exists) {
        const nowField = admin.firestore.FieldValue.serverTimestamp();
        const tasks = [
            privateRef.set(
                { lastLoginAt: nowField, updatedAt: nowField },
                { merge: true }
            ),
            publicRef.set({ lastActiveAt: nowField }, { merge: true }),
        ];

        // Ensure usernames registry entry exists
        const publicData = publicSnap.data() || {};
        const existingUsername = (publicData.username || "").toString();
        if (existingUsername) {
            const regRef = db.doc(`usernames/${existingUsername.toLowerCase()}`);
            tasks.push(regRef.set({ uid, touchedAt: nowField }, { merge: true }));
        }

        // Idempotent upsert of missing provider-derived fields (do NOT override user edits)
        const publicUpsert = {};
        if (
            !isNonEmptyString(publicData.displayName) &&
            isNonEmptyString(normalizedDisplayName)
        ) {
            publicUpsert.displayName = normalizedDisplayName;
        }
        if (
            !isNonEmptyString(publicData.photoURL) &&
            isNonEmptyString(normalizedPhotoURL)
        ) {
            publicUpsert.photoURL = normalizedPhotoURL;
        }
        if (Object.keys(publicUpsert).length > 0) {
            console.log("ensureUserDocument: filling missing public fields", {
                uid,
                ...publicUpsert,
            });
            tasks.push(publicRef.set(publicUpsert, { merge: true }));
        }

        const privateData = privateSnap.data() || {};
        const privateUpsert = {};
        if (
            !isNonEmptyString(privateData.authProvider) &&
            isNonEmptyString(normalizedAuthProvider)
        ) {
            privateUpsert.authProvider = normalizedAuthProvider;
        }
        if (
            typeof privateData.emailVerified !== "boolean" &&
            typeof token?.email_verified === "boolean"
        ) {
            privateUpsert.emailVerified = !!token.email_verified;
        }
        if (Object.keys(privateUpsert).length > 0) {
            console.log("ensureUserDocument: filling missing private fields", {
                uid,
                ...privateUpsert,
            });
            tasks.push(privateRef.set(privateUpsert, { merge: true }));
        }

        await Promise.all(tasks);
        return { created: false };
    }

    // ----- create new documents -----
    const displayName = normalizedDisplayName;
    let username = generateUsername(displayName) || generateRandomUsername();

    // ensure unique username; fall back to UUID if 10 random attempts fail
    let attempts = 0;
    try {
        while (attempts < 10) {
            const key = username.toLowerCase();
            const regRef = db.doc(`usernames/${key}`);
            const regSnap = await regRef.get();
            if (!regSnap.exists) break;
            username = generateRandomUsername();
            attempts++;
        }
    } catch (e) {
        console.warn("ensureUserDocument: username check failed, using fallback", e);
        attempts = 10; // force fallback below
    }

    if (attempts >= 10) {
        console.log("Initial random usernames taken - using UUID fallback");
        username = generateUUIDUsername();
    }

    // ----- create user documents (new only) -----
    const nowField = admin.firestore.FieldValue.serverTimestamp();
    await Promise.all([
        // Minimal root doc
        db.doc(`users/${uid}`).set({ uid, createdAt: nowField }, { merge: true }),
        // New public profile
        publicRef.set({
            username,
            displayName,
            photoURL: normalizedPhotoURL ?? null,
            bio: null,
            location: null,
            website: null,
            socialLinks: {},
            stats: {
                followersCount: 0,
                followingCount: 0,
                postsCount: 0,
                likesCount: 0,
                viewsCount: 0,
                uploadsCount: 0,
            },
            isArtist: false,
            isVerified: false,
            isPremium: false,
            artistCategories: [],
            featuredWorks: [],
            joinedAt: nowField,
            lastActiveAt: nowField,
        }),
        // New private profile
        privateRef.set({
            uid,
            email: (token && token.email) ?? null,
            authProvider: normalizedAuthProvider,
            emailVerified: !!(token && token.email_verified),
            roles: ["user"],
            permissions: [],
            profileComplete: false,
            accountStatus: "active",
            createdAt: nowField,
            updatedAt: nowField,
            lastLoginAt: nowField,
            loginCount: 1,
            stripeCustomerId: null,
        }),
        // New default settings
        settingsRef.set({
            notifications: {
                email: true,
                push: true,
                marketing: false,
                newFollowers: true,
                newLikes: true,
                newComments: true,
                modelUpdates: true,
            },
            theme: "auto",
            language: "en",
            timezone: "UTC",
            privacy: {
                profileVisibility: "public",
                showEmail: false,
                showLocation: true,
                showLastActive: true,
                allowMessages: "everyone",
            },
            security: {
                twoFactorEnabled: false,
                sessionTimeout: 60,
                loginNotifications: true,
            },
        }),
        // Username registry reservation
        db
            .doc(`usernames/${username.toLowerCase()}`)
            .set({ uid, createdAt: nowField }, { merge: true }),
    ]);

    return { created: true, username };
});

// Password reset functionality (TODO)
// Email verification (TODO)
// Social auth integration (TODO)
