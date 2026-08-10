import { useContext } from "react";
import { SystemAlertContext } from "../context/systemAlertContext";
import type { SystemAlertContextValue } from "../types/systemAlert";

export function useSystemAlert(): SystemAlertContextValue {
  const context = useContext(SystemAlertContext);

  if (!context) {
    throw new Error("useSystemAlert must be used within a SystemAlertProvider");
  }

  return context;
}
