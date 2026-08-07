import { useQuery } from "@tanstack/react-query";

import { getPublicProfile } from "@/features/user/services/publicProfileService";

export const usePublicProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["users", "public-profile", userId],

    queryFn: () => {
      if (!userId) {
        throw new Error("User ID is required");
      }

      return getPublicProfile(userId);
    },

    enabled: Boolean(userId),

    staleTime: 5 * 60 * 1000,
  });
};
