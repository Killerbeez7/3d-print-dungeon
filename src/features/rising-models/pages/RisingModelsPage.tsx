import { useState } from "react";
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";

import { buttonClassName } from "@/components";
import { ROUTES } from "@/constants/routeConstants";
import { HomeModelsGrid, HomeModelsGridSkeleton } from "@/features/home/components/HomeModelsGrid";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { useRisingModels } from "../hooks/useRisingModels";

import type { RisingModelsPeriod } from "../types/risingModels";

const PERIODS: { value: RisingModelsPeriod; label: string }[] = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
];

export const RisingModelsPage = () => {
  const [period, setPeriod] = useState<RisingModelsPeriod>(30);
  const { data: models = [], isPending, isError } = useRisingModels(period);

  return (
    <div className="min-h-screen bg-page pb-16">
      <PageHeader
        eyebrow="Collections"
        title="Rising models"
        description={`The most-liked uploads from the last ${period} days.`}
        aside={
          <div role="group" aria-label="Time period" className="flex gap-1">
            {PERIODS.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={period === item.value}
                onClick={() => setPeriod(item.value)}
                className={buttonClassName({
                  variant: period === item.value ? "primary" : "ghost",
                  size: "sm",
                  className: "font-mono [--cut:6px]",
                })}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-1 pt-1">
        {isPending ? (
          <HomeModelsGridSkeleton />
        ) : isError || models.length === 0 ? (
          <StatePanel
            icon={TrendingUp}
            headingLevel="h2"
            className="min-h-[50vh]"
            title={isError ? "Couldn't load rising models" : "Nothing rising yet"}
            actions={
              <Link to={ROUTES.HOME} className={buttonClassName()}>
                Browse all models
              </Link>
            }
          >
            {isError
              ? "Check your connection and refresh the page."
              : `No models were uploaded in the last ${period} days.`}
          </StatePanel>
        ) : (
          <HomeModelsGrid models={models} />
        )}
      </div>
    </div>
  );
};
