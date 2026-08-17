import type { Timestamp } from "firebase/firestore";

import type { PublicProfile } from "../types/profile";

function formatDate(value: Timestamp | Date | undefined): string {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : value.toDate();

  return date.toLocaleDateString();
}

interface PrivateStatsProps {
  user: PublicProfile;
}

export const PrivateStats = ({ user }: PrivateStatsProps) => {
  return (
    <div className="bg-section rounded-lg p-4 sm:p-6 shadow-md">
      <h2 className="text-2xl text-txt-primary mb-4 sm:mb-6">Private Statistics</h2>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
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

      {/* Additional Private Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
        <div className="text-center">
          <div className="mb-1 text-2xl font-bold text-txt-primary">
            {user.stats.followingCount}
          </div>
          <div className="text-xs text-txt-secondary sm:text-sm">Following</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-bold text-txt-primary">-</div>
          <div className="text-xs text-txt-secondary sm:text-sm">Collections</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-bold text-txt-primary">
            {user.isPremium ? "Premium" : "Free"}
          </div>
          <div className="text-xs text-txt-secondary sm:text-sm">Account Type</div>
        </div>

        <div className="text-center">
          <div className="mb-1 text-2xl font-bold text-txt-primary">
            {user.isVerified ? "✓" : "—"}
          </div>
          <div className="text-xs text-txt-secondary sm:text-sm">Verified</div>
        </div>
      </div>

      {/* Account Information */}
      <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-br-secondary">
        <h3 className="text-lg text-txt-primary mb-4">Account Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-card rounded-lg p-4">
            <p className="text-xs text-txt-muted">Member Since</p>
            <div className="text-txt-primary font-medium">
              {formatDate(user.joinedAt)}
            </div>
          </div>

          <div className="bg-surface-card rounded-lg p-4">
            <p className="text-xs text-txt-muted">Last Active</p>
            <div className="text-txt-primary font-medium">
              {formatDate(user.lastActiveAt)}
            </div>
          </div>

          {user.location && (
            <div className="bg-surface-card rounded-lg p-4">
              <p className="text-xs text-txt-muted">Location</p>
              <div className="text-txt-primary font-medium">{user.location}</div>
            </div>
          )}

          {user.website && (
            <div className="bg-surface-card rounded-lg p-4">
              <p className="text-xs text-txt-muted">Website</p>
              <div className="text-txt-primary font-medium">
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:text-accent-hover"
                >
                  {user.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
