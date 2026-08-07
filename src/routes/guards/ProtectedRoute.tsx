import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import type { Role } from "@/features/user/types/user";

type ProtectedRouteProps = {
  children: ReactNode;
  requireAdmin?: boolean;
  allowedRoles?: Role[];
  redirectTo?: string;
};

export function ProtectedRoute({
  children,
  requireAdmin = false,
  allowedRoles = [],
  redirectTo = "/",
}: ProtectedRouteProps) {
  const { currentUser, roles = [], isAdmin, loading } = useAuth();

  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!currentUser) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.some((role) => roles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
}
