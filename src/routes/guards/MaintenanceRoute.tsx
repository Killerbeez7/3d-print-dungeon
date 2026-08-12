import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMaintenance } from "@/features/maintenance/hooks/useMaintenance";

type MaintenanceRouteProps = {
  children: ReactNode;
};

export function MaintenanceRoute({ children }: MaintenanceRouteProps) {
  const { isAdmin } = useAuth();

  const { status, loading, hasError, adminBypass } = useMaintenance();

  if (loading) {
    return children;
  }

  if (hasError || !status) {
    return children;
  }

  if (status.inMaintenance && !(isAdmin && adminBypass)) {
    return <Navigate to="/maintenance" replace />;
  }

  return children;
}
