import { useParams } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { usePublicProfileByUsername } from "../hooks/usePublicProfile";

import { UserHeader } from "../components/UserHeader";
import { UserPortfolio } from "../components/UserPortfolio";
import { UserStats } from "../components/UserStats";
import { ProfileSettingsPanel } from "../components/ProfileSettingsPanel";
import { PrivateStats } from "../components/PrivateStats";
import { Spinner } from "@/features/shared/reusable/Spinner";
import { H1 } from "@/components/ResponsiveHeading";

export const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { currentUser } = useAuth();

  const { data: profile, isLoading, isError } = usePublicProfileByUsername(username);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!username || isError || !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <H1 size="2xl" className="text-txt-primary mb-4">
            User Not Found
          </H1>

          <p className="text-txt-secondary">
            {isError
              ? "Failed to load user profile."
              : "The user you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.uid === profile.uid;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <UserHeader user={profile} />

        {isOwner && (
          <div className="mt-6">
            <ProfileSettingsPanel user={profile} />
          </div>
        )}

        <div className="mt-8">
          <UserPortfolio user={profile} />
        </div>

        <div className="mt-8">
          {isOwner ? <PrivateStats user={profile} /> : <UserStats user={profile} />}
        </div>
      </div>
    </div>
  );
};
