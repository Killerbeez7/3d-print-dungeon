import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toUrlSafeName } from "@/utils/stringUtils";

export function MyProfileRedirect() {
    const navigate = useNavigate();
    const { currentUser, userData } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            // Redirect to login if not authenticated
            navigate("/");
            return;
        }

        // Redirect to user's profile using their display name
        const displayName = userData?.displayName || currentUser.displayName || "Anonymous";
        const urlSafeName = toUrlSafeName(displayName);
        navigate(`/${urlSafeName}`, { replace: true });
    }, [currentUser, userData, navigate]);

    return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                <p className="text-txt-secondary">Redirecting to your profile...</p>
            </div>
        </div>
    );
}
