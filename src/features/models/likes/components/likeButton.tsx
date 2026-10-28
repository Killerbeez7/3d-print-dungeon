import { Heart } from "lucide-react";

import { buttonClassName } from "@/components";

import type { CurrentUser } from "@/features/auth/types/auth";
import { useModelLike } from "../hooks/useModelLike";

export interface LikeButtonProps {
  modelId: string;
  initialLikes?: number;
  currentUser: CurrentUser | null;
  openAuthModal?: () => void;
}


export const LikeButton = ({
  modelId,
  initialLikes = 0,
  currentUser,
  openAuthModal,
}: LikeButtonProps) => {
  const { liked, likesCount, isLoading, isMutating, handleToggleLike } = useModelLike({
    modelId,
    initialLikes,
    currentUser,
  });

  const handleClick = async () => {
    if (!currentUser) {
      openAuthModal?.();

      return;
    }

    await handleToggleLike();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isMutating}
      aria-pressed={liked}
      aria-label={liked ? "Unlike model" : "Like model"}
      className={buttonClassName({
        variant: "secondary",
        className: `flex-1 ${liked ? "[--btn-edge:var(--ember)]" : ""}`,
      })}
    >
      <Heart
        className={`size-4 transition-transform duration-300 ${
          liked ? "scale-110 fill-ember-fill text-ember-fill" : ""
        }`}
        aria-hidden="true"
      />
      <span>{liked ? "Liked" : "Like"}</span>
      <span className="font-mono text-xs text-txt-muted">{likesCount}</span>
    </button>
  );
};
