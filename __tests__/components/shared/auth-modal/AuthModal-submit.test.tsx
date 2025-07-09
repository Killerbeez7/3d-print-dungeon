import { describe, it, expect } from "vitest";

import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModalProvider } from "@/providers/modalProvider";
import { AuthModal } from "@/components/shared/auth-modal/AuthModal";
import { useModal } from "@/hooks/useModal";

// --- mock useAuth ---
vi.mock("@/hooks/useAuth", () => {
    return {
        useAuth: () => ({
            handleEmailSignUp: vi.fn().mockResolvedValue(undefined),
            handleEmailSignIn: vi.fn().mockResolvedValue(undefined),
            // unused handlers
            handleGoogleSignIn: vi.fn(),
            handleFacebookSignIn: vi.fn(),
            handleTwitterSignIn: vi.fn(),
        }),
    };
});

function openModal(mode: "login" | "signup") {
    const Opener = () => {
        const { open } = useModal("auth");
        return <button onClick={() => open({ mode })}>open-{mode}</button>;
    };

    render(
        <ModalProvider>
            <AuthModal />
            <Opener />
        </ModalProvider>
    );

    fireEvent.click(screen.getByText(`open-${mode}`));
}

describe("AuthModal submit logic", () => {
    it("calls handleEmailSignIn then closes", async () => {
        openModal("login");

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: "a@b.com" },
        });
        fireEvent.change(screen.getByLabelText(/password/i), {
            target: { value: "secret" },
        });
        fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

        const { useAuth } = await import("@/hooks/useAuth");
        expect(useAuth().handleEmailSignIn).toHaveBeenCalled();

        await waitFor(() => {
            expect(
                screen.queryByRole("heading", { name: /sign in/i })
            ).not.toBeInTheDocument();
        });
    });

    it("calls handleEmailSignUp in signup mode", async () => {
        openModal("signup");

        fireEvent.change(screen.getByLabelText(/^email/i), {
            target: { value: "x@y.com" },
        });
        fireEvent.change(screen.getByLabelText(/^password/i), {
            target: { value: "pw1234" },
        });
        fireEvent.change(screen.getByLabelText(/confirm password/i), {
            target: { value: "pw1234" },
        });

        fireEvent.click(screen.getByRole("button", { name: /create account/i }));

        const { useAuth } = await import("@/hooks/useAuth");
        expect(useAuth().handleEmailSignUp).toHaveBeenCalled();
    });
});
