import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/authContext";
import PropTypes from "prop-types";

export const RouteGuard = ({ 
    children, 
    requireAuth = false,
    requireAdmin = false,
    redirectTo = "/login"
}) => {
    const { currentUser, isAdmin } = useAuth();
    const location = useLocation();

    // Admin check
    if (requireAdmin && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Auth check
    if (requireAuth && !currentUser) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    // Maintenance check will be added later
    return children;
};

RouteGuard.propTypes = {
    children: PropTypes.node.isRequired,
    requireAuth: PropTypes.bool,
    requireAdmin: PropTypes.bool,
    redirectTo: PropTypes.string
}; 