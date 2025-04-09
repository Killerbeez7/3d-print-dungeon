import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/authContext";

export const ProtectedRoute = ({ children }) => {
    const { maintenanceMode, isAuthorized, currentUser } = useAuth();

    if (maintenanceMode && !isAuthorized) {
        // If in maintenance mode and user is not authorized (not super admin)
        return <Navigate to="/maintenance" replace />;
    }

    // For routes that require authentication
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
}; 