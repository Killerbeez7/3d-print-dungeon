import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { AuthContext } from "@/contexts/authContext";

export const ProtectedRoute = ({
    children,
    requireAdmin = false,
    allowedRoles = [],
    redirectTo = "/login",
}) => {
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
};

ProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
        .isRequired,
    requireAdmin: PropTypes.bool,
    allowedRoles: PropTypes.arrayOf(PropTypes.string),
    redirectTo: PropTypes.string,
};

ProtectedRoute.defaultProps = {
    requireAdmin: false,
    allowedRoles: [],
    redirectTo: "/login",
};
