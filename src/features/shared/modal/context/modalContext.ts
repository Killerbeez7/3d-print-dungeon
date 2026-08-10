import { createContext } from "react";

import type { ModalContextValue } from "../types/modal";

export const ModalContext = createContext<ModalContextValue | null>(null);
