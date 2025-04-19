import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/authContext";
import { useState, useEffect } from "react";
import { subscribeToMaintenanceStatus } from "../../services/maintenanceService";

export const MaintenanceRoute = ({
    children,
    fallback = null,
    redirectTo = "/maintenance",
}) => {
    const { isAdmin } = useAuth();
    const [maintenanceState, setMaintenanceState] = useState({
        inMaintenance: false,
        message: null,
        endTime: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        try {
            const unsubscribe = subscribeToMaintenanceStatus((state) => {
                if (isMounted) {
                    setMaintenanceState(state);
                    setLoading(false);
                }
            });

            return () => {
                isMounted = false;
                unsubscribe();
            };
        } catch (err) {
            console.error("Error in MaintenanceRoute:", err);
            setError(err);
            setLoading(false);
        }
    }, []);

    // Handle errors gracefully
    if (error) {
        console.error("MaintenanceRoute error:", error);
        return children; // Fall back to showing the content if maintenance check fails
    }

    if (loading) {
        return fallback;
    }

    // If maintenance is on and user is not admin, redirect to maintenance page
    if (maintenanceState.inMaintenance && !isAdmin) {
        // Prevent infinite loops by not redirecting if we're already on the maintenance page
        if (window.location.pathname !== redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }
    }

    // If maintenance is off or user is admin, allow access
    return children;
};

MaintenanceRoute.propTypes = {
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node])
        .isRequired,
    fallback: PropTypes.node,
    redirectTo: PropTypes.string,
};

MaintenanceRoute.defaultProps = {
    fallback: null,
    redirectTo: "/maintenance",
};
