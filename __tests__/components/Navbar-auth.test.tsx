import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalProvider } from "@/providers/modalProvider";
import { Navbar } from "@/components/shared/navbar/Navbar";
import { AuthModal } from "@/components/shared/auth-modal/AuthModal";
import { MemoryRouter } from "react-router-dom";

const renderWithProviders = () =>
    render(
        <ModalProvider>
            <MemoryRouter>
                <Navbar />
                <AuthModal />
            </MemoryRouter>
        </ModalProvider>
    );

describe("Navbar ↔ AuthModal integration", () => {
    it("opens modal in login mode when Sign In clicked", () => {
        renderWithProviders();
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        expect(screen.getByRole("heading", { name: /sign in/i })).toBeInTheDocument();
    });
});
