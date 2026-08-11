import { useQuery } from "@tanstack/react-query";

import {
  getPublicProfileById,
  getPublicProfileByUsername,
} from "../services/profileService";

const PUBLIC_PROFILE_STALE_TIME = 5 * 60 * 1000;

export function usePublicProfile(userId?: string) {
  return useQuery({
    queryKey: ["users", "ppublic-profile", "id", userId],

    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return getPublicProfileById(userId);
    },

    enabled: Boolean(userId),
    staleTime: PUBLIC_PROFILE_STALE_TIME,
  });
}

export function usePublicProfileByUsername(username?: string) {
  const normalizedUsername = username?.trim().toLowerCase();

  return useQuery({
    queryKey: ["users", "public-profile", "username", normalizedUsername],

    queryFn: () => {
      if (!normalizedUsername) {
        throw new Error("Username is required");
      }

      return getPublicProfileByUsername(normalizedUsername);
    },

    enabled: Boolean(normalizedUsername),

    staleTime: PUBLIC_PROFILE_STALE_TIME,
  });
}
