import { Link, useParams, useSearchParams } from "react-router-dom";
import { UserRoundX } from "lucide-react";

import { buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { usePublicProfileByUsername } from "../hooks/usePublicProfile";
import { useCreatorModels } from "../hooks/useCreatorModels";

import { ProfileAbout } from "../components/ProfileAbout";
import { ProfileCard } from "../components/ProfileCard";
import { ProfileCover } from "../components/ProfileCover";
import { ProfileModels, ProfileModelsSkeleton } from "../components/ProfileModels";

type ProfileTab = "models" | "about";

const layoutClass =
  "mx-auto grid max-w-[1600px] gap-8 px-4 sm:px-6 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-10 lg:px-8 xl:grid-cols-[22rem_minmax(0,1fr)]";

const ProfileSkeleton = () => (
  <div role="status" aria-label="Loading profile">
    <div className="skeleton-print h-44 sm:h-60 lg:h-72" />
    <div className={layoutClass}>
      <div>
        <div className="skeleton-print chamfer -mt-16 size-[7.75rem] [--cut:20px] sm:-mt-20 sm:size-[9.75rem]" />
        <div className="skeleton-line mt-4 h-8 w-48" />
        <div className="skeleton-line mt-2 h-4 w-28" />
        <div className="skeleton-line mt-5 h-4 w-full" />
        <div className="skeleton-line mt-2 h-4 w-4/5" />
        <div className="skeleton-line mt-6 h-16 w-full" />
      </div>
      <div className="pt-6">
        <ProfileModelsSkeleton />
      </div>
    </div>
  </div>
);

export const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentUser } = useAuth();

  const { data: profile, isLoading, isError } = usePublicProfileByUsername(username);
  const creator = useCreatorModels(profile?.uid);
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
    { id: "models", label: "Models", count: creator.totals?.models },
    { id: "about", label: "About" },
  ];

  return (
    <div className="min-h-screen bg-page pb-16">
      <ProfileCover seed={profile.username} models={creator.models} />

      <div className={layoutClass}>
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ProfileCard user={profile} isOwner={isOwner} totals={creator.totals} />
        </aside>

        <div className="min-w-0 lg:pt-6">
          <div
            role="tablist"
            aria-label="Profile sections"
            className="sticky top-16 z-30 -mx-4 mb-6 flex gap-1 border-b border-br-subtle bg-page px-4 md:bg-page/85 md:backdrop-blur-xl sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
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
                {item.count !== undefined && <span className="font-mono text-xs text-txt-muted">{item.count}</span>}
              </button>
            ))}
          </div>

          <div role="tabpanel">
            {tab === "about" ? (
              <ProfileAbout user={profile} />
            ) : creator.isLoading ? (
              <ProfileModelsSkeleton />
            ) : creator.isError ? (
              <p className="rounded-lg border border-error/40 bg-error/10 p-4 text-sm text-txt-primary">
                We couldn&apos;t load these models. Refresh to try again.
              </p>
            ) : (
              <ProfileModels models={creator.models} displayName={profile.displayName} isOwner={isOwner} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
