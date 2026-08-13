import { db } from "@/config/firebaseConfig";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore";

import type { ModelData } from "@/features/models/types/model";
import type { FetchRisingModelsOptions } from "../types/risingModels";

const DEFAULT_LIMIT = 12;

export async function fetchRisingModels(
  options: FetchRisingModelsOptions
): Promise<ModelData[]> {
  const { period, limit = DEFAULT_LIMIT } = options;

  const cutoffDate = new Date();

  cutoffDate.setDate(cutoffDate.getDate() - period);

  const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

  const risingQuery = query(
    collection(db, "models"),
    where("createdAt", ">=", cutoffTimestamp),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(risingQuery);

  const models = snapshot.docs.map((document) => {
    return {
      ...(document.data() as ModelData),
      id: document.id,
    };
  });

  const rankedModels = models.sort((firstModel, secondModel) => {
    const firstLikes = firstModel.likes ?? 0;
    const secondLikes = secondModel.likes ?? 0;

    return secondLikes - firstLikes;
  });

  return rankedModels.slice(0, limit);
}
