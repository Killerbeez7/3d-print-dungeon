export type ModalId = "auth" | "alert";

export type ModalPayload = Record<string, unknown>;

export interface ModalState {
  isOpen: boolean;
  payload?: ModalPayload;
}

export interface ModalContextValue {
  getState: (id: ModalId) => ModalState;
  open: (id: ModalId, payload?: ModalPayload) => void;
  close: (id: ModalId) => void;
  toggle: (id: ModalId, payload?: ModalPayload) => void;
}
