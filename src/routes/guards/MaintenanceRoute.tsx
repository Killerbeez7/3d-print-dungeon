import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useState, useEffect, ReactNode } from "react";
import { subscribeToMaintenanceStatus } from "@/features/maintenance/services/maintenanceService";
import { MaintenanceStatus } from "@/features/maintenance/types/maintenance";

interface MaintenanceRouteProps {
    children: ReactNode;
    fallback?: ReactNode;
    redirectTo?: string;
}

export function MaintenanceRoute({
    children,
    fallback = null,
    redirectTo = "/maintenance",
}: MaintenanceRouteProps): ReactNode {
    const { isAdmin } = useAuth();
    const [maintenanceState, setMaintenanceState] = useState<MaintenanceStatus>({
        inMaintenance: false,
        message: null,
        endTime: null,
        isAdmin: false,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let isMounted = true;
        try {
            const unsubscribe = subscribeToMaintenanceStatus((state: MaintenanceStatus) => {
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
        return children;
    }

    if (loading) {
        return fallback;
    }

    // If maintenance is on and user is not admin, redirect to maintenance page
    if (maintenanceState.inMaintenance && !isAdmin) {
        if (window.location.pathname !== redirectTo) {
            return <Navigate to={redirectTo} replace />;
        }
    }

    // If maintenance is off or user is admin, allow access
    return children;
}
