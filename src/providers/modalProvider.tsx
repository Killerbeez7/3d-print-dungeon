import { useState, useCallback, ReactNode, useMemo } from "react";
import {
    ModalContext,
    ModalId,
    ModalPayload,
    ModalState,
    ModalContextValue,
} from "@/contexts/modalContext";

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [modals, setModals] = useState<Record<ModalId, ModalState>>({});

    //helpers
    const getState = useCallback(
        (id: ModalId): ModalState => modals[id] ?? { isOpen: false },
        [modals]
    );

    const open = useCallback(
        (id: ModalId, payload?: ModalPayload) =>
            setModals((prev) => ({
                ...prev,
                [id]: { isOpen: true, payload },
            })),
        []
    );

    const close = useCallback(
        (id: ModalId) =>
            setModals((prev) => ({
                ...prev,
                [id]: { ...prev[id], isOpen: false },
            })),
        []
    );

    const toggle = useCallback(
        (id: ModalId, payload?: ModalPayload) =>
            setModals((prev) => {
                const prevState = prev[id] ?? { isOpen: false, payload: undefined };

                // payload supplied - stay open, swap payload
                if (payload !== undefined) {
                    return { ...prev, [id]: { isOpen: true, payload } };
                }

                // no payload → true/false
                return {
                    ...prev,
                    [id]: { ...prevState, isOpen: !prevState.isOpen },
                };
            }),
        []
    );

    const value: ModalContextValue = useMemo(
        () => ({ getState, open, close, toggle }),
        [getState, open, close, toggle]
    );

    return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
