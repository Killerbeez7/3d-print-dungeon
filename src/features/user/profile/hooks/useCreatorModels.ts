import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, limit, query, where } from "firebase/firestore";

import { db } from "@/config/firebaseConfig";
import type { ModelData } from "@/features/models/types/model";

/** Upper bound per profile; sorting and totals happen in the browser. */
const MAX_MODELS = 500;

const createdTime = (model: ModelData): number => {
  const value = model.createdAt as unknown;
  if (!value) return 0;
  if (value instanceof Date) return value.getTime();
  if (typeof value === "object" && value !== null && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return Number((value as { seconds: number }).seconds) * 1000;
  }
  const parsed = new Date(value as string | number).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

export interface CreatorTotals {
  models: number;
  views: number;
  likes: number;
}

/**
 * All of a creator's listings in one query (an equality filter only, so it
 * needs no composite index), newest first, with live totals.
 */
export function useCreatorModels(uid?: string) {
  const result = useQuery({
    queryKey: ["models", "creator", uid],
    queryFn: async () => {
      const snap = await getDocs(
        query(collection(db, "models"), where("uploaderId", "==", uid), limit(MAX_MODELS))
      );
      return snap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as ModelData)
        .sort((a, b) => createdTime(b) - createdTime(a));
    },
    enabled: Boolean(uid),
    staleTime: 2 * 60 * 1000,
  });

  const totals = useMemo<CreatorTotals | null>(() => {
    if (!result.data) return null;
    return result.data.reduce<CreatorTotals>(
      (sum, model) => ({
        models: sum.models + 1,
        views: sum.views + (model.views ?? 0),
        likes: sum.likes + (model.likes ?? 0),
      }),
      { models: 0, views: 0, likes: 0 }
    );
  }, [result.data]);

  return { ...result, models: result.data ?? [], totals };
}

export { createdTime };
