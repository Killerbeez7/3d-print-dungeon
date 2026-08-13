import { useQuery } from "@tanstack/react-query";
import { fetchRisingModels } from "../services/risingModelsService";

import type { RisingModelsPeriod } from "../types/risingModels";

export function useRisingModels(period: RisingModelsPeriod) {
  return useQuery({
    queryKey: ["models", "rising", period],
    queryFn: () => {
      return fetchRisingModels({ period });
    },
  });
}
