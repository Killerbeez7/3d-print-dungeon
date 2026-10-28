import { Link, useParams, useSearchParams } from "react-router-dom";
import { UserRoundX } from "lucide-react";

import { buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { usePublicProfileByUsername } from "../hooks/usePublicProfile";

import { ProfileAbout } from "../components/ProfileAbout";
import { ProfileHero } from "../components/ProfileHero";
import { ProfileModels } from "../components/ProfileModels";
import { ProfileStats } from "../components/ProfileStats";

type ProfileTab = "models" | "about";

const ProfileSkeleton = () => (
  <div role="status" aria-label="Loading profile">
    <div className="skeleton-print h-40 sm:h-56" />
    <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
      <div className="-mt-14 flex items-end gap-4 sm:-mt-16">
        <div className="skeleton-print chamfer size-[7.75rem] [--cut:20px] sm:size-[8.75rem]" />
        <div className="space-y-2 pb-2">
          <div className="skeleton-print h-8 w-56" />
          <div className="skeleton-print h-4 w-28" />
        </div>
      </div>
      <div className="skeleton-print mt-6 h-16" />
    </div>
  </div>
);

export const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const { data: profile, isLoading, isError } = usePublicProfileByUsername(username);
  const tab: ProfileTab = searchParams.get("tab") === "about" ? "about" : "models";

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!username || isError || !profile) {
    return (
      <StatePanel
        icon={UserRoundX}
        title={isError ? "Couldn't load this profile" : "User not found"}
        actions={
          <Link to="/artists" className={buttonClassName()}>
            Browse artists
          </Link>
        }
      >
        {isError
          ? "Check your connection and refresh the page."
          : "The user you're looking for doesn't exist, or changed their username."}
      </StatePanel>
    );
  }

  const isOwner = currentUser?.uid === profile.uid;

  const tabs: { id: ProfileTab; label: string; count?: number }[] = [
    { id: "models", label: "Models", count: profile.stats.uploadsCount },
    { id: "about", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-page pb-16">
      <ProfileHero user={profile} isOwner={isOwner} />

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <ProfileStats user={profile} />
      </div>

      {/* Sticky tab bar under the header */}
      <div className="sticky top-16 z-30 mt-6 border-b border-br-subtle bg-page/85 backdrop-blur-xl">
        <div
          role="tablist"
          aria-label="Profile sections"
          className="mx-auto flex max-w-[1600px] gap-1 px-4 sm:px-6 lg:px-8"
        >
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() =>
                setSearchParams(item.id === "models" ? {} : { tab: item.id }, {
                  replace: true,
                  preventScrollReset: true,
                })
              }
              className={`relative flex h-12 items-center gap-2 px-3 text-sm font-semibold transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge ${
                tab === item.id
                  ? "text-txt-primary after:scale-x-100"
                  : "text-txt-muted after:scale-x-0 hover:text-txt-primary"
              }`}
            >
              {item.label}
              {item.count !== undefined && (
                <span className="font-mono text-xs text-txt-muted">{item.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div role="tabpanel" className={tab === "models" ? "px-1 pt-1" : ""}>
        {tab === "models" ? (
          <ProfileModels userId={profile.uid} displayName={profile.displayName} isOwner={isOwner} />
        ) : (
          <ProfileAbout user={profile} />
        )}
      </div>
    </div>
  );
};
