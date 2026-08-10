import { useState, useCallback, useMemo, type ReactNode } from "react";
import { SystemAlertContext } from "../context/systemAlertContext";
import type {
  SystemAlert,
  ShowSystemAlert,
  SystemAlertInput,
  SystemAlertContextValue,
} from "../types/systemAlert";

export const SystemAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  const removeAlert = useCallback((id: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const addAlert = useCallback(
    (alert: SystemAlertInput) => {
      const newAlert: SystemAlert = {
        ...alert,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      };

      setAlerts((current) => [...current, newAlert]);

      if (alert.duration !== 0) {
        const duration = alert.duration ?? 5000;

        setTimeout(() => {
          removeAlert(newAlert.id);
        }, duration);
      }
    },
    [removeAlert]
  );

  const success = useCallback<ShowSystemAlert>(
    (title, message, duration) => {
      addAlert({
        type: "success",
        title,
        message,
        duration,
      });
    },
    [addAlert]
  );

  const error = useCallback<ShowSystemAlert>(
    (title, message, duration) => {
      addAlert({
        type: "error",
        title,
        message,
        duration,
      });
    },
    [addAlert]
  );

  const warning = useCallback<ShowSystemAlert>(
    (title, message, duration) => {
      addAlert({
        type: "warning",
        title,
        message,
        duration,
      });
    },
    [addAlert]
  );

  const info = useCallback<ShowSystemAlert>(
    (title, message, duration) => {
      addAlert({
        type: "info",
        title,
        message,
        duration,
      });
    },
    [addAlert]
  );

  const value = useMemo<SystemAlertContextValue>(
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

  return (
    <SystemAlertContext.Provider value={value}>{children}</SystemAlertContext.Provider>
  );
};
