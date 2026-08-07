import { useContext } from "react";

import { MaintenanceContext } from "@/features/maintenance/context/maintenanceContext";

export function useMaintenance() {
  const context = useContext(MaintenanceContext);

  if (!context) {
    throw new Error("useMaintenance must be used within a MaintenanceProvider");
  }

  return context;
}
