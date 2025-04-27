import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { subscribeToMaintenanceStatus } from "@/services/maintenanceService";

export const MaintenancePage = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [maintenanceState, setMaintenanceState] = useState({
        inMaintenance: false,
        message: "We're currently performing some updates to improve your experience.",
        endTime: null,
        isAdmin: false
    });
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const unsubscribe = subscribeToMaintenanceStatus((state) => {
            setMaintenanceState(state);
        }, currentUser?.uid);

        return () => unsubscribe();
    }, [currentUser?.uid]);

    // Update countdown timer
    useEffect(() => {
        if (maintenanceState.endTime) {
            const updateTimer = () => {
                const now = new Date();
                // Adjust for GMT+3
                const adjustedNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));
                const adjustedEnd = new Date(maintenanceState.endTime.getTime() + (3 * 60 * 60 * 1000));
                const diff = adjustedEnd - adjustedNow;

                if (diff <= 0) {
                    setTimeLeft(null);
                    return;
                }

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft({ hours, minutes, seconds });
            };

            updateTimer();
            const timer = setInterval(updateTimer, 1000);

            return () => clearInterval(timer);
        }
    }, [maintenanceState.endTime]);

    return (
        <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center">
            <div className="max-w-lg w-full mx-4 p-8 bg-white rounded-xl shadow-2xl text-center">
                <div className="mb-8">
                    <img 
                        src="/logo.png" 
                        alt="Site Logo" 
                        className="h-16 w-auto mx-auto mb-6"
                    />
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Under Maintenance
                    </h1>
                    <div className="text-xl text-gray-600 mb-6">
                        {maintenanceState.message}
                    </div>
                    {timeLeft && (
                        <div className="text-lg font-medium text-accent mb-6">
                            Expected completion in: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
                        </div>
                    )}
                    {maintenanceState.isAdmin && (
                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
                        >
                            Access Site
                        </button>
                    )}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-600">
                        If you&apos;re an administrator, please sign in to access the site.
                    </div>
                </div>
            </div>
        </div>
    );
};
