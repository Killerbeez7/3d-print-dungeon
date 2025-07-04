import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { subscribeToMaintenanceStatus } from "@/services/maintenanceService";

interface MaintenanceState {
    inMaintenance: boolean;
    message: string | null;
    endTime: Date | null;
    isAdmin: boolean;
}

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

export const MaintenancePage = () => {
    const navigate = useNavigate();
    const { currentUser, isAdmin } = useAuth();
    const [maintenanceState, setMaintenanceState] = useState<MaintenanceState>({
        inMaintenance: false,
        message: null,
        endTime: null,
        isAdmin: false,
    });
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToMaintenanceStatus((state: MaintenanceState) => {
            setMaintenanceState(state);
        }, currentUser?.uid as string | null | undefined);

        return () => unsubscribe();
    }, [currentUser?.uid]);

    // Update countdown timer
    useEffect(() => {
        if (maintenanceState.endTime) {
            const updateTimer = () => {
                const now = new Date();
                // Adjust for GMT+3
                const adjustedNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
                const adjustedEnd = new Date(
                    maintenanceState.endTime!.getTime() + 3 * 60 * 60 * 1000
                );
                const diff = adjustedEnd.getTime() - adjustedNow.getTime();

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

    const AccessSiteBtn = () => {
        return (
            <button
                onClick={() => navigate("/")}
                className="mt-6 px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors"
            >
                Access Site
            </button>
        );
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-12">
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
                        {maintenanceState.message ??
                            "We're currently performing some updates to improve your experience."}
                    </div>
                    {timeLeft && (
                        <div className="text-lg font-medium text-accent mb-6">
                            Expected completion in: {timeLeft.hours}h {timeLeft.minutes}m{" "}
                            {timeLeft.seconds}s
                        </div>
                    )}
                    {(isAdmin || maintenanceState.isAdmin) && <AccessSiteBtn />}
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <div className="text-sm text-gray-600">
                        If you&apos;re an administrator, please sign in to access the
                        site.
                    </div>
                </div>
            </div>
        </div>
    );
};
