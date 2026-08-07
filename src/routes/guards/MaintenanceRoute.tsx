import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { useMaintenance } from "@/features/maintenance/hooks/useMaintenance";
import { Spinner } from "@/features/shared/reusable/Spinner";

type MaintenanceRouteProps = {
  children: ReactNode;
};

export function MaintenanceRoute({ children }: MaintenanceRouteProps) {
  const { isAdmin } = useAuth();

  const { status, loading, hasError, adminBypass } = useMaintenance();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-primary text-txt-primary">
        <Spinner size={50} />
      </div>
    );
  }

  if (hasError || !status) {
    return children;
  }

  if (status.inMaintenance && !(isAdmin && adminBypass)) {
    return <Navigate to="/maintenance" replace />;
  }

  return children;
}
