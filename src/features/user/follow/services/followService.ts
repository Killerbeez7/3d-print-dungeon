import {
  doc,
  getDoc,
  type DocumentSnapshot,
  type DocumentData,
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/config/firebaseConfig";

import type { FollowStatus } from "../types/follow";

const getStatCount = (
  snapshot: DocumentSnapshot<DocumentData> | null,
  field: "followersCount" | "followingCount"
): number => {
  if (!snapshot?.exists()) {
    return 0;
  }

  const value = snapshot.get(`stats.${field}`);

  return typeof value === "number" ? value : 0;
};

export const followService = {
  async getFollowStatus(
    targetUserId: string,
    currentUserId?: string
  ): Promise<FollowStatus> {
    if (!targetUserId) {
      throw new Error("Target user ID is required.");
    }

    const targetProfilePromise = getDoc(doc(db, "users", targetUserId, "public", "data"));

    const currentProfilePromise = currentUserId
      ? getDoc(doc(db, "users", currentUserId, "public", "data"))
      : Promise.resolve(null);

    const relationPromise =
      currentUserId && currentUserId !== targetUserId
        ? getDoc(doc(db, "follows", `${currentUserId}_${targetUserId}`))
        : Promise.resolve(null);

    const [targetProfile, currentProfile, relation] = await Promise.all([
      targetProfilePromise,
      currentProfilePromise,
      relationPromise,
    ]);

    return {
      isFollowing: relation?.exists() ?? false,

      followersCount: getStatCount(targetProfile, "followersCount"),
      followingCount: getStatCount(currentProfile, "followingCount"),
    };
  },

  async toggleFollow(targetUserId: string): Promise<FollowStatus> {
    if (!targetUserId) {
      throw new Error("Target user ID is required.");
    }

    const toggleFollowCallable = httpsCallable<{ targetUserId: string }, FollowStatus>(
      functions,
      "toggleFollow"
    );

    const result = await toggleFollowCallable({
      targetUserId,
    });

    return result.data;
  },
};
