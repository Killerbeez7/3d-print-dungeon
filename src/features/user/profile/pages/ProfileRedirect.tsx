import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { toUrlSafeUsername } from "@/utils/stringUtils";

export const ProfileRedirect = () => {
    const { currentUser, userData } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Wait until we know if user is logged in and have userData loaded
        if (currentUser === undefined || userData === undefined) return;

        if (!currentUser) {
            navigate("/", { replace: true });
            return;
        }

        const username = userData?.username || currentUser.uid;
        const safeUsername = toUrlSafeUsername(username);

        navigate(`/${safeUsername}`, { replace: true });
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
