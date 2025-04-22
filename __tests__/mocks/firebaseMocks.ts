import { vi } from 'vitest';

// Mock Firebase Auth
export const mockAuth = {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
};

// Mock Firebase Firestore
export const mockFirestore = {
    collection: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(),
};

// Mock Firebase Storage
export const mockStorage = {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn(),
    deleteObject: vi.fn(),
};

// Mock Firebase App
export const mockFirebaseApp = {
    auth: () => mockAuth,
    firestore: () => mockFirestore,
    storage: () => mockStorage,
};

// Mock Firebase initialization
export const initializeApp = vi.fn(() => mockFirebaseApp);
export const getAuth = vi.fn(() => mockAuth);
export const getFirestore = vi.fn(() => mockFirestore);
export const getStorage = vi.fn(() => mockStorage); 