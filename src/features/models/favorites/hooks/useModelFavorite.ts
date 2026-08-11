import { useState, useEffect } from "react";

import {
  getFavoritesForUser,
  toggleFavorite,
} from "@/features/models/favorites/services/favoritesService";

interface UseModelFavoriteParams {
  modelId: string;
  userId?: string;
}

export function useModelFavorite({ modelId, userId }: UseModelFavoriteParams) {
  const [favorited, setFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    const loadFavoriteState = async () => {
      if (!userId) {
        setFavorited(false);

        return;
      }

      setIsLoading(true);

      try {
        const favorites = await getFavoritesForUser(userId);

        setFavorited(favorites.includes(modelId));
      } catch (error) {
        console.error("Failed to load favorite state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadFavoriteState();
  }, [modelId, userId]);

  const handleToggleFavorite = async () => {
    if (!userId || isMutating) {
      return;
    }

    setIsMutating(true);

    try {
      const nextFavorited = await toggleFavorite(userId, modelId);

      setFavorited(nextFavorited);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    favorited,
    isLoading,
    isMutating,
    handleToggleFavorite,
  };
}
