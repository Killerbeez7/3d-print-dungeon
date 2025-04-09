import { useAuth } from "../../contexts/authContext";
import { Navigate } from "react-router-dom";

export const MaintenancePage = () => {
    const { maintenanceMode, isAuthorized } = useAuth();

    // If site is not in maintenance mode or user is authorized (super admin)
    // redirect to home page
    if (!maintenanceMode || isAuthorized) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Site Maintenance
                </h1>
                <div className="text-xl text-gray-600 mb-6">
                    We're currently performing maintenance on our site.
                    <br />
                    Please check back soon!
                </div>
                <div className="text-sm text-gray-500">
                    Only administrators can access the site during maintenance.
                </div>
            </div>
        </div>
    );
}; 