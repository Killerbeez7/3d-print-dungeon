import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../contexts/authContext";
import { useState, useEffect } from "react";
import { subscribeToMaintenanceStatus } from "../services/maintenanceService";

export const MaintenanceRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const [maintenanceState, setMaintenanceState] = useState({ inMaintenance: false, isAdmin: false });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeToMaintenanceStatus((state) => {
            setMaintenanceState(state);
            setLoading(false);
        }, currentUser?.uid);

        return () => unsubscribe();
    }, [currentUser?.uid]);

    if (loading) {
        return null; // Or a loading spinner
    }

    // If maintenance is on and user is not admin, redirect to maintenance page
    if (maintenanceState.inMaintenance && !maintenanceState.isAdmin) {
        return <Navigate to="/maintenance" replace />;
    }

    // If maintenance is off or user is admin, allow access
    return children;
};

MaintenanceRoute.propTypes = {
    children: PropTypes.node.isRequired,
}; 