import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

import type { CurrentUser } from "@/features/auth/types/auth";
import { useModelFavorite } from "../hooks/useModelFavorite";

export interface FavoritesButtonProps {
  modelId: string;
  currentUser: CurrentUser | null;
  openAuthModal?: () => void;
}

export const FavoritesButton = ({
  modelId,
  currentUser,
  openAuthModal,
}: FavoritesButtonProps) => {
  const { favorited, isLoading, isMutating, handleToggleFavorite } = useModelFavorite({
    modelId,
    userId: currentUser?.uid,
  });

  const handleClick = async () => {
    if (!currentUser) {
      openAuthModal?.();

      return;
    }

    await handleToggleFavorite();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || isMutating}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      className="inline-flex items-center gap-2 cursor-pointer"
    >
      <FontAwesomeIcon
        icon={favorited ? solidStar : regularStar}
        className={favorited ? "text-yellow-500 text-xl" : "text-gray-400 text-xl"}
      />

      <span className="text-sm">{favorited ? "Favorited" : "Favorite"}</span>
    </button>
  );
};
