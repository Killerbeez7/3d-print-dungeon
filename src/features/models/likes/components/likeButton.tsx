import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as solidHeart } from "@fortawesome/free-solid-svg-icons";
import { faHeart as regularHeart } from "@fortawesome/free-regular-svg-icons";

import type { CurrentUser } from "@/features/auth/types/auth";
import { useModelLike } from "../hooks/useModelLike";

export interface LikeButtonProps {
  modelId: string;
  initialLikes?: number;
  currentUser: CurrentUser | null;
  openAuthModal?: () => void;
}

const formatLikesCount = (count: number): string => {
  return count === 1 ? "1 Like" : `${count} Likes`;
};

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
      className="inline-flex items-center gap-2"
    >
      <span className="flex items-center justify-center">
        <FontAwesomeIcon
          icon={liked ? solidHeart : regularHeart}
          className={liked ? "text-red-500 text-xl" : "text-gray-400 text-xl"}
        />
      </span>

      <span>{formatLikesCount(likesCount)}</span>
    </button>
  );
};
