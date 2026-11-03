import { Navigate } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { DieLoader } from "@/features/shared/components/Die";
import { toUrlSafeUsername } from "@/utils/stringUtils";

export const ProfileRedirect = () => {
  const { currentUser, publicProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DieLoader edge={22} />
          <p className="mt-4 text-txt-secondary">Redirecting to your profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (!publicProfile?.username) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <DieLoader edge={22} />
          <p className="mt-4 text-txt-secondary">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const username = toUrlSafeUsername(publicProfile.username);

  return <Navigate to={`/${username}`} replace />;
};
