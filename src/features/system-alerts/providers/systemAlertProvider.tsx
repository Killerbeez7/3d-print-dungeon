import { useState, useCallback, ReactNode, useMemo } from "react";
import { SystemAlertContext } from "../context/systemAlertContext";
import type { SystemAlertContextValue, SystemAlert, SystemAlertType } from "../types/systemAlert";

export const SystemAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const addAlert = useCallback(
    (alert: Omit<SystemAlert, "id" | "createdAt">) => {
      const newAlert: SystemAlert = {
        ...alert,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };

      setAlerts((prev) => [...prev, newAlert]);

      // Auto-remove alert after duration (default 5 seconds)
      if (alert.duration !== 0) {
        const duration = alert.duration ?? 5000;
        setTimeout(() => {
          removeAlert(newAlert.id);
        }, duration);
      }
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const createAlertHelper = useCallback(
    (type: SystemAlertType) =>
      (title: string, message: string, duration?: number) => {
        addAlert({ type, title, message, duration });
      },
    [addAlert]
  );

  const success = useMemo(() => createAlertHelper("success"), [createAlertHelper]);
  const error = useMemo(() => createAlertHelper("error"), [createAlertHelper]);
  const warning = useMemo(() => createAlertHelper("warning"), [createAlertHelper]);
  const info = useMemo(() => createAlertHelper("info"), [createAlertHelper]);

  const value: SystemAlertContextValue = useMemo(
    () => ({
      alerts,
      addAlert,
      removeAlert,
      clearAllAlerts,
      success,
      error,
      warning,
      info,
    }),
    [alerts, addAlert, removeAlert, clearAllAlerts, success, error, warning, info]
  );

  return <SystemAlertContext.Provider value={value}>{children}</SystemAlertContext.Provider>;
};
