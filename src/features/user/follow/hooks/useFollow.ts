import { useState, useEffect } from "react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { followService } from "../services/followService";

import type { FollowStatus } from "../types/follow";

const EMPTY_FOLLOW_STATUS: FollowStatus = {
  isFollowing: false,
  followersCount: 0,
  followingCount: 0,
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong with the follow request.";
};

export const useFollow = (targetUserId: string) => {
  const { currentUser } = useAuth();

  const [status, setStatus] = useState<FollowStatus>(EMPTY_FOLLOW_STATUS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canFollow = !currentUser || currentUser.uid !== targetUserId;

  useEffect(() => {
    let ignore = false;

    const loadFollowStatus = async () => {
      if (!targetUserId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextStatus = await followService.getFollowStatus(
          targetUserId,
          currentUser?.uid
        );

        if (!ignore) {
          setStatus(nextStatus);
        }
      } catch (caughtError) {
        if (!ignore) {
          setError(getErrorMessage(caughtError));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    loadFollowStatus();

    return () => {
      ignore = true;
    };
  }, [currentUser?.uid, targetUserId]);

  const toggleFollow = async (): Promise<FollowStatus> => {
    if (!currentUser) {
      throw new Error("You must be signed in to follow a user.");
    }

    if (currentUser.uid === targetUserId) {
      throw new Error("You cannot follow yourself.");
    }

    setLoading(true);
    setError(null);

    try {
      const nextStatus = await followService.toggleFollow(targetUserId);

      setStatus(nextStatus);

      return nextStatus;
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));

      throw caughtError;
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing: status.isFollowing,
    followersCount: status.followersCount,
    followingCount: status.followingCount,

    loading,
    error,
    canFollow,
    toggleFollow,
  };
};
