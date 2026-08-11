import type { ReactNode } from "react";
import type { Role } from "@/features/auth/types/permissions";

import { MaintenanceRoute } from "@/routes/guards/MaintenanceRoute";
import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

type MaintenanceOptions = {
  fallback?: ReactNode;
  redirectTo?: string;
};

type ProtectedOptions = {
  requireAdmin?: boolean;
  redirectTo?: string;
  allowedRoles?: Role[];
};

type ProtectedMaintenanceOptions = {
  fallback?: ReactNode;
  maintenanceRedirect?: string;
  requireAdmin?: boolean;
  allowedRoles?: Role[];
  authRedirect?: string;
};

export function withMaintenance(element: ReactNode, options: MaintenanceOptions = {}) {
  return (
    <MaintenanceRoute fallback={options.fallback} redirectTo={options.redirectTo}>
      {element}
    </MaintenanceRoute>
  );
}

export function withProtected(element: ReactNode, options: ProtectedOptions = {}) {
  return (
    <ProtectedRoute
      requireAdmin={options.requireAdmin}
      redirectTo={options.redirectTo}
      allowedRoles={options.allowedRoles}
    >
      {element}
    </ProtectedRoute>
  );
}

export function withProtectedMaintenance(
  element: ReactNode,
  options: ProtectedMaintenanceOptions = {}
) {
  return (
    <MaintenanceRoute
      fallback={options.fallback}
      redirectTo={options.maintenanceRedirect}
    >
      <ProtectedRoute
        requireAdmin={options.requireAdmin}
        allowedRoles={options.allowedRoles}
        redirectTo={options.authRedirect}
      >
        {element}
      </ProtectedRoute>
    </MaintenanceRoute>
  );
}
