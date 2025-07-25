import { useContext, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/features/auth/context/authContext";

interface ProtectedRouteProps {
    children: ReactNode;
    requireAdmin?: boolean;
    allowedRoles?: string[];
    redirectTo?: string;
}

export function ProtectedRoute({
    children,
    requireAdmin = false,
    allowedRoles = [],
    redirectTo = "/login",
}: ProtectedRouteProps): React.ReactNode | null {
    const { currentUser, roles = [], isAdmin, loading } = useContext(AuthContext);
    const location = useLocation();

    // Still loading auth state
    if (loading) return null; // or show a spinner if you want

    // Not authenticated
    if (!currentUser && location.pathname !== redirectTo) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    // Explicit admin check
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Role-based check
    if (allowedRoles.length > 0 && !allowedRoles.some((r) => roles.includes(r))) {
        return <Navigate to="/" replace />;
    }

    return children;
}
