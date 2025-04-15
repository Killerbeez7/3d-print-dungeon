import { Navigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/authContext";

export const ProtectedRoute = ({ children, requireAdmin = false, redirectTo = "/login" }) => {
    const { currentUser, isAdmin } = useAuth();
    const location = useLocation();

    // Don't redirect if we're already on the login page
    if (!currentUser && location.pathname !== redirectTo) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    // For admin-only routes
    if (requireAdmin && !isAdmin && location.pathname !== "/") {
        return <Navigate to="/" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired,
    requireAdmin: PropTypes.bool,
    redirectTo: PropTypes.string
};

ProtectedRoute.defaultProps = {
    requireAdmin: false,
    redirectTo: "/login"
}; 