import type { Timestamp } from "firebase/firestore";

import type { PublicProfile } from "../types/profile";

interface UserStatsProps {
  user: PublicProfile;
}

function getMemberSinceYear(value: Timestamp | Date | undefined): number | string {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : value.toDate();

  return date.getFullYear();
}

export function UserStats({ user }: UserStatsProps) {
  return (
    <div className="rounded-lg bg-section p-4 shadow-md sm:p-6">
      <h2 className="mb-4 text-2xl text-txt-primary sm:mb-6">Statistics</h2>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
        <div className="text-center">
          <div className="mb-1 text-3xl font-bold text-txt-highlight sm:mb-2">
            {user.stats.uploadsCount}
          </div>

          <div className="text-xs text-txt-secondary sm:text-sm">Total Uploads</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-3xl font-bold text-txt-highlight sm:mb-2">
            {user.stats.likesCount}
          </div>

          <div className="text-xs text-txt-secondary sm:text-sm">Total Likes</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-3xl font-bold text-txt-highlight sm:mb-2">
            {user.stats.viewsCount}
          </div>

          <div className="text-xs text-txt-secondary sm:text-sm">Total Views</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-3xl font-bold text-txt-highlight sm:mb-2">
            {user.stats.followersCount}
          </div>

          <div className="text-xs text-txt-secondary sm:text-sm">Followers</div>
        </div>
      </div>

      <div className="mt-6 border-t border-br-secondary pt-4 sm:mt-8 sm:pt-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
          <div className="text-center">
            <div className="mb-1 text-2xl font-bold text-txt-primary sm:mb-2">
              {user.stats.followingCount}
            </div>

            <div className="text-xs text-txt-secondary sm:text-sm">Following</div>
          </div>

          <div className="text-center">
            <div className="mb-1 text-2xl font-bold text-txt-primary sm:mb-2">
              {user.isPremium ? 1 : 0}
            </div>

            <div className="text-xs text-txt-secondary sm:text-sm">Premium</div>
          </div>

          <div className="text-center">
            <div className="mb-1 text-2xl font-bold text-txt-primary sm:mb-2">
              {getMemberSinceYear(user.joinedAt)}
            </div>

            <div className="text-xs text-txt-secondary sm:text-sm">Member Since</div>
          </div>
        </div>
      </div>
    </div>
  );
}
