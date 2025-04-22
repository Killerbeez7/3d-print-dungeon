import { vi } from 'vitest';

export type User = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
};

export type UserData = {
    username: string;
    role: string;
};

// Base mock auth context
export const createMockAuthContext = (overrides = {}) => ({
    currentUser: null as User | null,
    loading: false,
    userData: null as UserData | null,
    authError: "",
    maintenanceMode: false,
    isAdminUser: false,
    handleSignOut: vi.fn(),
    isAdmin: false,
    ...overrides,
});

// Mock auth context with logged in user
export const mockAuthContextWithUser = createMockAuthContext({
    currentUser: {
        uid: "123",
        displayName: "John Doe",
        email: "john@example.com",
        photoURL: "https://example.com/photo.jpg",
    },
    userData: {
        username: "johndoe",
        role: "user",
    },
});

// Mock auth context with admin user
export const mockAuthContextWithAdmin = createMockAuthContext({
    currentUser: {
        uid: "456",
        displayName: "Admin User",
        email: "admin@example.com",
        photoURL: "https://example.com/admin.jpg",
    },
    userData: {
        username: "admin",
        role: "admin",
    },
    isAdminUser: true,
    isAdmin: true,
});

// Mock auth context with loading state
export const mockAuthContextLoading = createMockAuthContext({
    loading: true,
});

// Mock auth context with error
export const mockAuthContextWithError = createMockAuthContext({
    authError: "Authentication failed",
});

// Create a mock implementation of useAuth
export const mockUseAuth = vi.fn(() => createMockAuthContext()); 