import { useState } from "react";

import { useRisingModels } from "../hooks/useRisingModels";
import { RisingModelsGrid } from "../components/RisingModelsGrid";

import { Spinner } from "@/features/shared/reusable/Spinner";

import type { RisingModelsPeriod } from "../types/risingModels";

export const RisingModelsPage = () => {
  const [period, setPeriod] = useState<RisingModelsPeriod>(7);

  const { data: models, isPending, isError } = useRisingModels(period);

  return (
    <main className="min-h-screen text-center text-txt-primary">
      <div className="px-4 pt-8">
        <h1 className="pb-2 font-bold">Rising Models</h1>

        <p className="pb-6 text-txt-secondary">Discover models gaining attention.</p>

        <div className="mb-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setPeriod(7);
            }}
            className={
              period === 7
                ? "rounded-full bg-accent px-4 py-2 text-btn-primary-text"
                : "rounded-full bg-surface-card px-4 py-2 text-txt-secondary hover:text-txt-primary"
            }
          >
            Last 7 days
          </button>

          <button
            type="button"
            onClick={() => {
              setPeriod(30);
            }}
            className={
              period === 30
                ? "rounded-full bg-accent px-4 py-2 text-btn-primary-text"
                : "rounded-full bg-surface-card px-4 py-2 text-txt-secondary hover:text-txt-primary"
            }
          >
            Last 30 days
          </button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 lg:px-8">
        {isPending ? (
          <div className="flex justify-center py-12">
            <Spinner size={24} />
          </div>
        ) : isError ? (
          <div className="py-12 text-txt-secondary">Failed to load rising models.</div>
        ) : models.length === 0 ? (
          <div className="py-12 text-txt-secondary">
            No rising models found for this period.
          </div>
        ) : (
          <RisingModelsGrid models={models} />
        )}
      </div>
    </main>
  );
};
