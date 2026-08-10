import { useCallback, useContext } from "react";

import { ModalContext } from "../context/modalContext";
import type { ModalId, ModalPayload, ModalState } from "../types/modal";

export interface UseModalResult extends ModalState {
  open: (payload?: ModalPayload) => void;
  close: () => void;
  toggle: (payload?: ModalPayload) => void;
}

export function useModal(id: ModalId): UseModalResult {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }

  const { getState, open: openModal, close: closeModal, toggle: toggleModal } = context;

  const { isOpen, payload } = getState(id);

  const open = useCallback(
    (nextPayload?: ModalPayload) => {
      openModal(id, nextPayload);
    },
    [id, openModal]
  );

  const close = useCallback(() => {
    closeModal(id);
  }, [id, closeModal]);

  const toggle = useCallback(
    (nextPayload?: ModalPayload) => {
      toggleModal(id, nextPayload);
    },
    [id, toggleModal]
  );

  return {
    isOpen,
    payload,
    open,
    close,
    toggle,
  };
}
