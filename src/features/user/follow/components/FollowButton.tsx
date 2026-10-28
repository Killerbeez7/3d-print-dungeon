import { clsx } from "clsx";
import { Check, Plus } from "lucide-react";

import { buttonClassName } from "@/components";

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

const variantMap = {
  primary: "primary",
  secondary: "secondary",
  outline: "secondary",
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
          buttonClassName({
            // Once followed, the button calms down to the secondary style.
            variant: isFollowing ? "secondary" : variantMap[variant],
            size,
          }),
          loading && "opacity-60",
          className
        )}
        title={
          isFollowing
            ? `Unfollow ${targetUserName || "user"}`
            : `Follow ${targetUserName || "user"}`
        }
      >
        {isFollowing ? (
          <Check className="size-4" aria-hidden="true" />
        ) : (
          <Plus className="size-4" aria-hidden="true" />
        )}
        {isFollowing ? "Following" : "Follow"}
      </button>
      {showCount && (
        <span className="mt-1 text-xs text-txt-secondary">
          {followersCount} {followersCount === 1 ? "follower" : "followers"}
        </span>
      )}
      {error && <span className="mt-1 text-xs text-error">{error}</span>}
    </div>
  );
};
