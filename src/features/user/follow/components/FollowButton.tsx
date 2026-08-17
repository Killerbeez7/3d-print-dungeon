import { clsx } from "clsx";

import { useAuth } from "@/features/auth";
import { useFollow } from "../hooks/useFollow";

interface FollowButtonProps {
  targetUserId: string;
  targetUserName?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline";
  showCount?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  openAuthModal?: () => void;
}

const sizeClasses = {
  sm: "px-2 py-1 text-xs",
  md: "px-3 py-1.5 text-sm",
  lg: "px-4 py-2 text-base",
} as const;

const variantClasses = {
  primary: "bg-accent hover:bg-accent-hover text-white",
  secondary: "bg-section hover:bg-muted text-txt-primary",
  outline: "border border-br-primary hover:bg-section text-txt-primary",
} as const;

export const FollowButton = ({
  targetUserId,
  targetUserName,
  className = "",
  size = "md",
  variant = "primary",
  showCount = false,
  onFollowChange,
  openAuthModal,
}: FollowButtonProps) => {
  const { currentUser } = useAuth();

  const { isFollowing, followersCount, loading, error, toggleFollow, canFollow } =
    useFollow(targetUserId);

  const handleClick = async () => {
    if (!currentUser) {
      openAuthModal?.();
      return;
    }

    if (!canFollow || loading) {
      return;
    }

    try {
      const nextStatus = await toggleFollow();

      onFollowChange?.(nextStatus.isFollowing);
    } catch {}
  };

  if (!canFollow) {
    return null;
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleClick}
        disabled={loading}
        className={clsx(
          "flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200",
          sizeClasses[size],
          variantClasses[variant],
          loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105",
          className
        )}
        title={
          isFollowing
            ? `Unfollow ${targetUserName || "user"}`
            : `Follow ${targetUserName || "user"}`
        }
      >
        {isFollowing ? "Following" : "Follow"}
      </button>
      {showCount && (
        <span className="mt-1 text-xs text-txt-secondary">
          {followersCount} {followersCount === 1 ? "follower" : "followers"}
        </span>
      )}
      {error && <span className="mt-1 text-xs text-red-500">{error}</span>}
    </div>
  );
};
