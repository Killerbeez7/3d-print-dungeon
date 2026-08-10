import type { Timestamp } from "firebase/firestore";
import type { PublicProfile } from "../types/profile";
import { H2, StatValue, StatValueSecondary, Label } from "@/components/index";

function getMemberSinceYear(value: Timestamp | Date | undefined): number | string {
  if (!value) {
    return "N/A";
  }

  const date = value instanceof Date ? value : value.toDate();

  return date.getFullYear();
}

interface UserStatsProps {
  user: PublicProfile;
}

export const UserStats = ({ user }: UserStatsProps) => {
  return (
    <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 shadow-md">
      <H2 size="2xl" className="text-txt-primary mb-4 sm:mb-6">
        Statistics
      </H2>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="text-center">
          <StatValue as="div" className="mb-1 sm:mb-2">
            {user.stats.uploadsCount}
          </StatValue>
          <Label as="div" className="text-xs sm:text-sm">
            Total Uploads
          </Label>
        </div>

        <div className="text-center">
          <StatValue as="div" className="mb-1 sm:mb-2">
            {user.stats.likesCount}
          </StatValue>
          <Label as="div" className="text-xs sm:text-sm">
            Total Likes
          </Label>
        </div>

        <div className="text-center">
          <StatValue as="div" className="mb-1 sm:mb-2">
            {user.stats.viewsCount}
          </StatValue>
          <Label as="div" className="text-xs sm:text-sm">
            Total Views
          </Label>
        </div>

        <div className="text-center">
          <StatValue as="div" className="mb-1 sm:mb-2">
            {user.stats.followersCount}
          </StatValue>
          <Label as="div" className="text-xs sm:text-sm">
            Followers
          </Label>
        </div>
      </div>

      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-br-secondary">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="text-center">
            <StatValueSecondary as="div" className="mb-1 sm:mb-2">
              {user.stats.followingCount}
            </StatValueSecondary>
            <Label as="div" className="text-xs sm:text-sm">
              Following
            </Label>
          </div>

          <div className="text-center">
            <StatValueSecondary as="div" className="mb-1 sm:mb-2">
              {user.isPremium ? 1 : 0}
            </StatValueSecondary>
            <Label as="div" className="text-xs sm:text-sm">
              Premium
            </Label>
          </div>

          <div className="text-center">
            <StatValueSecondary as="div" className="mb-1 sm:mb-2">
              {getMemberSinceYear(user.joinedAt)}
            </StatValueSecondary>
            <Label as="div" className="text-xs sm:text-sm">
              Member Since
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
};
