import { createContext } from "react";
import type { SystemAlertContextValue } from "../types/systemAlert";

export const SystemAlertContext = createContext<SystemAlertContextValue | null>(null);
