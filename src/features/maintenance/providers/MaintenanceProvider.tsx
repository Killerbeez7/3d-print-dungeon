import { useEffect, useState, type ReactNode } from "react";

import { MaintenanceContext } from "@/features/maintenance/context/maintenanceContext";
import { subscribeToMaintenanceStatus } from "@/features/maintenance/services/maintenanceService";

import type { MaintenanceStatus } from "@/features/maintenance/types/maintenance";

type MaintenanceProviderProps = {
  children: ReactNode;
};

const ADMIN_BYPASS_KEY = "maintenance-admin-bypass";

export function MaintenanceProvider({ children }: MaintenanceProviderProps) {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);

  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const [adminBypass, setAdminBypass] = useState(
    () => sessionStorage.getItem(ADMIN_BYPASS_KEY) === "true"
  );

  const enableAdminBypass = () => {
    sessionStorage.setItem(ADMIN_BYPASS_KEY, "true");

    setAdminBypass(true);
  };

  useEffect(() => {
    try {
      const unsubscribe = subscribeToMaintenanceStatus(
        (nextStatus) => {
          if (!nextStatus.inMaintenance) {
            sessionStorage.removeItem(ADMIN_BYPASS_KEY);

            setAdminBypass(false);
          }

          setStatus(nextStatus);
          setHasError(false);
          setLoading(false);
        },

        (error) => {
          console.error("Maintenance provider error:", error);

          setHasError(true);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error("Failed to initialize maintenance provider:", error);

      setHasError(true);
      setLoading(false);
    }
  }, []);

  return (
    <MaintenanceContext.Provider
      value={{
        status,
        loading,
        hasError,
        adminBypass,
        enableAdminBypass,
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}
