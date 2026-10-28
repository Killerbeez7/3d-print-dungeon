import { Bookmark } from "lucide-react";

import { buttonClassName } from "@/components";

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
      className={buttonClassName({
        variant: "secondary",
        className: `flex-1 ${favorited ? "[--btn-edge:var(--accent)]" : ""}`,
      })}
    >
      <Bookmark
        className={`size-4 ${favorited ? "fill-accent text-accent" : ""}`}
        aria-hidden="true"
      />
      <span>{favorited ? "Saved" : "Save"}</span>
    </button>
  );
};
