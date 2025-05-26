import { createContext } from "react";

/* ---------- Types ---------- */

export type ModalId = "auth" | "alert" | string;

export interface ModalPayload {
  [key: string]: unknown;
}

export interface ModalState {
  isOpen: boolean;
  payload?: ModalPayload;
}

export interface ModalContextValue {
  getState(id: ModalId): ModalState;
  open(id: ModalId, payload?: ModalPayload): void;
  close(id: ModalId): void;
  toggle(id: ModalId, payload?: ModalPayload): void;
}

/* ---------- Context ---------- */

export const ModalContext = createContext<ModalContextValue | null>(null);