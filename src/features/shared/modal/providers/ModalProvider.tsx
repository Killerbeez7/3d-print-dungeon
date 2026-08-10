import { useState, useMemo, useCallback, type ReactNode } from "react";
import { ModalContext } from "@/features/shared/modal/context/modalContext";
import type {
  ModalId,
  ModalState,
  ModalPayload,
  ModalContextValue,
} from "../types/modal";

const closedModalState: ModalState = {
  isOpen: false,
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modals, setModals] = useState<Partial<Record<ModalId, ModalState>>>({});

  const getState = useCallback(
    (id: ModalId): ModalState => {
      return modals[id] ?? closedModalState;
    },
    [modals]
  );

  const open = useCallback((id: ModalId, payload?: ModalPayload) => {
    setModals((current) => ({
      ...current,
      [id]: {
        isOpen: true,
        payload,
      },
    }));
  }, []);

  const close = useCallback((id: ModalId) => {
    setModals((current) => {
      const currentState = current[id] ?? closedModalState;

      return {
        ...current,
        [id]: {
          ...currentState,
          isOpen: false,
        },
      };
    });
  }, []);

  const toggle = useCallback((id: ModalId, payload?: ModalPayload) => {
    setModals((current) => {
      const currentState = current[id] ?? closedModalState;

      if (payload !== undefined) {
        return {
          ...current,
          [id]: {
            isOpen: true,
            payload,
          },
        };
      }

      return {
        ...current,
        [id]: {
          ...currentState,
          isOpen: !currentState.isOpen,
        },
      };
    });
  }, []);

  const value = useMemo<ModalContextValue>(
    () => ({
      getState,
      open,
      close,
      toggle,
    }),
    [getState, open, close, toggle]
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};
