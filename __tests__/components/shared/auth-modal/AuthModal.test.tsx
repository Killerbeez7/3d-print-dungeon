import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModalProvider } from "@/providers/modalProvider";
import { AuthModal } from "@/components/shared/auth-modal/AuthModal";
import { useModal } from "@/hooks/useModal";

// helper component to trigger modal open
const Opener = () => {
    const { open } = useModal("auth");
    return <button onClick={() => open({ mode: "login" })}>open</button>;
};

const setup = () =>
    render(
        <ModalProvider>
            <AuthModal />
            <Opener />
        </ModalProvider>
    );

describe("AuthModal", () => {
    it("renders login mode then switches to signup", () => {
        setup();
        fireEvent.click(screen.getByText(/open/i));

        // login visible
        const titleLogin = screen.getByRole("heading", { name: /sign in/i });
        expect(titleLogin).toBeInTheDocument();

        // swap to signup
        fireEvent.click(screen.getByRole("button", { name: /sign up/i }));
        const titleSignup = screen.getByRole("heading", { name: /sign up/i });
        expect(titleSignup).toBeInTheDocument();
    });

    it("closes when ESC key pressed", () => {
        setup();
        fireEvent.click(screen.getByText(/open/i));
        fireEvent.keyDown(window, { key: "Escape" });
        expect(
            screen.queryByRole("heading", { name: /sign in/i })
        ).not.toBeInTheDocument();
    });
});
