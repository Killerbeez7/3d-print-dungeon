/**
 * Unit-tests for the modal manager hook.
 * Path:  <repo-root>/__tests__/hooks/useModal.test.tsx
 */
import { renderHook, act } from "@testing-library/react";
import { ModalProvider } from "@/providers/ModalProvider";
import { useModal } from "@/hooks/useModal";

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ModalProvider>{children}</ModalProvider>
);

describe("useModal", () => {
    it("opens, swaps payload, then closes", () => {
        const { result } = renderHook(() => useModal("auth"), { wrapper });

        // closed by default
        expect(result.current.isOpen).toBe(false);

        // open -> login
        act(() => result.current.open({ mode: "login" }));
        expect(result.current.isOpen).toBe(true);
        expect(result.current.payload).toEqual({ mode: "login" });

        // swap -> signup (should stay open)
        act(() => result.current.toggle({ mode: "signup" }));
        expect(result.current.isOpen).toBe(true);
        expect(result.current.payload).toEqual({ mode: "signup" });

        // close
        act(() => result.current.close());
        expect(result.current.isOpen).toBe(false);
    });
});
