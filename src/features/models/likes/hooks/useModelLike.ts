import { useState, useEffect } from "react";

import type { CurrentUser } from "@/features/auth/types/auth";
import { isLiked, toggleLike } from "@/features/models/likes/services/likesService";

interface UseModelLikeParams {
  modelId: string;
  initialLikes?: number;
  currentUser: CurrentUser | null;
}

const normalizeLikesCount = (count: number | undefined): number => {
  return Math.max(0, count ?? 0);
};

export function useModelLike({ modelId, initialLikes, currentUser }: UseModelLikeParams) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(normalizeLikesCount(initialLikes));
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    setLikesCount(normalizeLikesCount(initialLikes));
  }, [modelId, initialLikes]);

  useEffect(() => {
    const loadLikedState = async () => {
      if (!currentUser) {
        setLiked(false);

        return;
      }

      setIsLoading(true);

      try {
        const nextLiked = await isLiked(modelId, currentUser.uid);

        setLiked(nextLiked);
      } catch (error) {
        console.error("Failed to load model like state:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadLikedState();
  }, [modelId, currentUser]);

  const handleToggleLike = async () => {
    if (!currentUser || isMutating) {
      return;
    }

    setIsMutating(true);

    try {
      const nextLiked = await toggleLike(modelId, currentUser.uid);

      setLiked(nextLiked);

      setLikesCount((currentCount) => {
        const change = nextLiked ? 1 : -1;

        return Math.max(0, currentCount + change);
      });
    } catch (error) {
      console.error("Failed to toggle model like:", error);
    } finally {
      setIsMutating(false);
    }
  };

  return {
    liked,
    likesCount,
    isLoading,
    isMutating,
    handleToggleLike,
  };
}
