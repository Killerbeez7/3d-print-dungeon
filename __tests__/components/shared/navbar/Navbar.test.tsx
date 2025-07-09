import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "@/components/shared/navbar/Navbar";

type User = {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
};

// Mock Firebase
vi.mock("firebase/app", () => ({
    initializeApp: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
    getFirestore: vi.fn(),
    collection: vi.fn(),
    query: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
    getDocs: vi.fn(() => ({
        docs: [],
    })),
}));

vi.mock("@/config/firebase", () => ({
    auth: {
        currentUser: null,
    },
    db: {
        collection: vi.fn(),
    },
}));

// Mock contexts
const mockAuthContext = {
    currentUser: null as User | null,
    loading: false,
    userData: null as { username: string; role: string } | null,
    authError: "",
    maintenanceMode: false,
    isAdminUser: false,
    handleSignOut: vi.fn(),
    isAdmin: false,
};

const mockSearchContext = {
    searchQuery: "",
    setSearchQuery: vi.fn(),
    searchResults: [],
    setSearchResults: vi.fn(),
    isSearching: false,
    setIsSearching: vi.fn(),
    setShowDropdown: vi.fn(),
    searchTerm: "",
    setSearchTerm: vi.fn(),
    setActiveTab: vi.fn(),
    activeTab: "all",
    showDropdown: false,
    handleClearSearch: vi.fn(),
};

vi.mock("@/contexts/authContext", () => ({
    useAuth: () => mockAuthContext,
}));

vi.mock("@/contexts/searchContext", () => ({
    useSearch: () => mockSearchContext,
}));

describe("Navbar", () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
    });

    // ---------------------- USER LOGGED IN ----------------------
    describe("USER", () => {
        beforeEach(() => {
            // Set up logged in state
            mockAuthContext.currentUser = {
                uid: "123",
                displayName: "John Doe",
                email: "john@example.com",
                photoURL: "https://example.com/photo.jpg",
            };
            mockAuthContext.userData = {
                username: "johndoe",
                role: "user",
            };
        });

        // ---------------------- USER PROFILE BUTTON ----------------------
        it("render user profile button", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const profileLink = screen.getByRole("link", { name: /profile/i });
            expect(profileLink).toBeInTheDocument();
            expect(profileLink).toHaveAttribute(
                "href",
                `/artist/${mockAuthContext.currentUser?.uid}`
            );
            expect(profileLink).toHaveAttribute("data-discover", "true");
            expect(profileLink).toHaveClass(
                "block",
                "px-4",
                "py-2",
                "text-md",
                "text-txt-secondary",
                "hover:bg-bg-secondary",
                "hover:text-txt-primary"
            );
        });

        // ---------------------- UPLOAD MODEL BUTTON ----------------------
        it("render upload model button", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const uploadModelLink = screen.getByRole("link", {
                name: /upload model:desktop/i,
            });
            expect(uploadModelLink).toBeInTheDocument();
        });

        // ---------------------- USER DISPLAY NAME ----------------------
        it("render user's display name", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const displayName = screen.getByText("John Doe");
            expect(displayName).toBeInTheDocument();
        });

        // ---------------------- SIGN IN/ SIGN UP BUTTONS ----------------------
        it("DO NOT render Sign In/ Sign Up buttons", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const signInButton = screen.queryByRole("button", { name: /sign in/i });
            expect(signInButton).not.toBeInTheDocument();

            const signUpButton = screen.queryByRole("button", { name: /sign up/i });
            expect(signUpButton).not.toBeInTheDocument();
        });
    });

    // ---------------------- USER NOT LOGGED IN ----------------------
    describe("NO USER", () => {
        beforeEach(() => {
            // Set up logged out state
            mockAuthContext.currentUser = null;
            mockAuthContext.userData = null;
        });

        it("render Sign In/ Sign Up buttons", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const signInButton = screen.getByRole("button", { name: /sign in/i });
            expect(signInButton).toBeInTheDocument();

            const signUpButton = screen.getByRole("button", { name: /sign up/i });
            expect(signUpButton).toBeInTheDocument();
        });

        it("DO NOT render user profile button", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const profileButton = screen.queryByRole("button", { name: /profile/i });
            expect(profileButton).not.toBeInTheDocument();
        });

        it("DO NOT render upload model button", () => {
            render(
                <BrowserRouter>
                    <Navbar />
                </BrowserRouter>
            );

            const uploadModelLink = screen.queryByRole("link", {
                name: /upload model:desktop/i,
            });
            expect(uploadModelLink).not.toBeInTheDocument();
        });
    });
});
