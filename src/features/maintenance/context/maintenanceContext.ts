import { createContext } from "react";

import type { MaintenanceStatus } from "@/features/maintenance/types/maintenance";

export type MaintenanceContextValue = {
  status: MaintenanceStatus | null;
  loading: boolean;
  hasError: boolean;
  adminBypass: boolean;
  enableAdminBypass: () => void;
};

export const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);
