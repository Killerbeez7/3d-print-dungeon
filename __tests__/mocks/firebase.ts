import { vi } from "vitest";

/**
 * Firebase Mocks for Testing
 * 
 * Usage:
 *   import { setAuthUser, clearAuthUser, setAuthError, mockUser } from "../mocks/firebase";
 *   setAuthUser(mockUser); // Simulate logged-in
 *   clearAuthUser();       // Simulate logged-out
 *   setAuthError("error message"); // Simulate auth error
 **/


// Auth State
let _authUser: Record<string, unknown> | null = null;

export const mockUser = {
    uid: "test-uid",
    email: "test@example.com",
    displayName: "Test User",
    roles: ["user"],
};

export function setAuthUser(user: Record<string, unknown>) {
    _authUser = user;
}
export function clearAuthUser() {
    _authUser = null;
}

vi.mock("firebase/auth", () => {
    return {
        getAuth: () => ({}),
        onAuthStateChanged: (_auth: unknown, cb: (user: unknown) => void) => {
            console.log("MOCK onAuthStateChanged called", _authUser);
            setTimeout(() => {
                cb(_authUser);
            }, 0);
            return () => { };
        },
        signOut: vi.fn(),
        // ...other mocks as needed
    };
});

// firebase/firestore
vi.mock("firebase/firestore", () => {
    return {
        getFirestore: () => ({}),
        doc: vi.fn(),
        getDoc: vi.fn(),
        setDoc: vi.fn(),
        updateDoc: vi.fn(),
        collection: vi.fn(),
        addDoc: vi.fn(),
        onSnapshot: vi.fn(() => () => { }),
        // Add more as needed
    };
});

// firebase/storage
vi.mock("firebase/storage", () => {
    return {
        getStorage: () => ({}),
        ref: vi.fn(),
        uploadBytesResumable: vi.fn(),
        getDownloadURL: vi.fn(),
        // Add more as needed
    };
});
