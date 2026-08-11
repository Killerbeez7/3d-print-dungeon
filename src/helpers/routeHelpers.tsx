import type { ReactNode } from "react";
import type { Role } from "@/features/auth/types/permissions";

import { ProtectedRoute } from "@/routes/guards/ProtectedRoute";

type ProtectedOptions = {
  requireAdmin?: boolean;
  redirectTo?: string;
  allowedRoles?: Role[];
};

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
