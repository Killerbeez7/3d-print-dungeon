import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { toUrlSafeUsername } from "@/utils/stringUtils";

export const ProfileRedirect = () => {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait until auth state and user data are known
        if (currentUser === undefined || userData === undefined) return;

        if (!currentUser) {
            navigate("/", { replace: true });
            return;
        }

        // Only redirect once a proper username is available
        if (userData?.username) {
            const safeUsername = toUrlSafeUsername(userData.username);
            navigate(`/${safeUsername}`, { replace: true });
        }
        // Otherwise, keep spinner until ensureUserDocument populates username
    }, [currentUser, userData, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <Spinner size={32} />
                <p className="mt-4 text-txt-secondary">Redirecting to your profile...</p>
            </div>
        </div>
    );
};
