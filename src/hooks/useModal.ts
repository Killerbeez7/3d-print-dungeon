import { useContext } from "react";
import {
    ModalContext,
    ModalId,
    ModalPayload,
    ModalState,
} from "@/contexts/modalContext";

/**
 * useModal("auth") ➜ { isOpen, payload, open(), close(), toggle() }
 */
export const useModal = (id: ModalId) => {
    const ctx = useContext(ModalContext);
    if (!ctx)
        throw new Error("useModal must be used inside <ModalProvider>");

    const { getState, open, close, toggle } = ctx;
    const { isOpen, payload }: ModalState = getState(id);

    return {
        isOpen,
        payload,
        open: (p?: ModalPayload) => open(id, p),
        close: () => close(id),
        toggle: (p?: ModalPayload) => toggle(id, p),
    };
};
