import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Flame, Upload } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { ModelCard, ModelCardSkeleton } from "@/features/home/components/ModelCard";
import type { ModelData } from "@/features/models/types/model";

import { createdTime } from "../hooks/useCreatorModels";

type Filter = "all" | "free" | "paid";
type Sort = "newest" | "views" | "likes";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "free", label: "Free" },
  { id: "paid", label: "Paid" },
];

const SORTS: Record<Sort, { label: string; compare: (a: ModelData, b: ModelData) => number }> = {
  newest: { label: "Newest", compare: (a, b) => createdTime(b) - createdTime(a) },
  views: { label: "Most viewed", compare: (a, b) => (b.views ?? 0) - (a.views ?? 0) },
  likes: { label: "Most liked", compare: (a, b) => (b.likes ?? 0) - (a.likes ?? 0) },
};

const PAGE = 24;
const isPaid = (model: ModelData) => Boolean(model.isPaid && model.price);

const gridClass = "grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export const ProfileModelsSkeleton = () => (
  <div className={gridClass} role="status" aria-label="Loading models">
    {Array.from({ length: 10 }, (_, index) => (
      <ModelCardSkeleton key={index} index={index} />
    ))}
  </div>
);

interface ProfileModelsProps {
  models: ModelData[];
  displayName: string;
  isOwner: boolean;
}

/** Most popular work first, then everything with filters and sorting. */
export const ProfileModels = ({ models, displayName, isOwner }: ProfileModelsProps) => {
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [shown, setShown] = useState(PAGE);

  const popular = useMemo(
    () =>
      models.length >= 6
        ? [...models]
            .sort(SORTS.views.compare)
            // One tile per image, in case listings share a render.
            .filter(
              (model, index, list) =>
                !model.renderPrimaryUrl ||
                list.findIndex((other) => other.renderPrimaryUrl === model.renderPrimaryUrl) === index
            )
            .slice(0, 3)
        : [],
    [models]
  );

  const visible = useMemo(
    () =>
      models
        .filter((model) => filter === "all" || (filter === "paid") === isPaid(model))
        .sort(SORTS[sort].compare),
    [models, filter, sort]
  );

  if (!models.length) {
    return (
      <div className="bg-buildplate flex flex-col items-center rounded-xl border border-dashed border-br-secondary px-6 py-16 text-center">
        <span className="chamfer flex size-14 items-center justify-center bg-muted text-txt-muted [--cut:10px]">
          <Box className="size-7" aria-hidden="true" />
        </span>
        <p className="mt-4 text-base font-semibold text-txt-primary">
          {isOwner ? "Your shelf is empty" : `${displayName} hasn't shared models yet`}
        </p>
        {isOwner && (
          <>
            <p className="mt-1 text-sm text-txt-secondary">Upload your first model to fill it.</p>
            <Link to="/model/upload" className={buttonClassName({ className: "mt-5" })}>
              <Upload className="size-4" aria-hidden="true" />
              Upload a model
            </Link>
          </>
        )}
      </div>
    );
  }

  const counts = {
    all: models.length,
    free: models.filter((model) => !isPaid(model)).length,
    paid: models.filter(isPaid).length,
  };

  return (
    <div className="space-y-8">
      {popular.length > 0 && (
        <section aria-labelledby="popular-heading">
          <h2 id="popular-heading" className="label-mono mb-3 flex items-center gap-2 text-txt-muted">
            <Flame className="size-3.5 text-ember" aria-hidden="true" />
            Most popular
          </h2>
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
            {popular.map((model, index) => (
              <div key={model.id} className={index === 2 ? "hidden sm:block" : ""}>
                <ModelCard model={model} priority />
              </div>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="all-heading">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 id="all-heading" className="label-mono text-txt-muted">
            All models
          </h2>
          <div className="ml-auto flex items-center gap-2">
            <div className="flex rounded-lg border border-br-subtle p-0.5" role="group" aria-label="Show">
              {FILTERS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={filter === item.id}
                  disabled={item.id !== "all" && counts[item.id] === 0}
                  onClick={() => {
                    setFilter(item.id);
                    setShown(PAGE);
                  }}
                  className={`flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium transition-colors disabled:opacity-40 ${
                    filter === item.id ? "bg-accent-soft text-txt-primary" : "text-txt-secondary hover:text-txt-primary"
                  }`}
                >
                  {item.label}
                  <span className="label-mono text-[0.65rem] text-txt-muted">{counts[item.id]}</span>
                </button>
              ))}
            </div>
            <label>
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
                className="h-9 rounded-lg border border-br-input bg-surface-card px-2 text-sm text-txt-primary"
              >
                {Object.entries(SORTS).map(([id, option]) => (
                  <option key={id} value={id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className={gridClass}>
          {visible.slice(0, shown).map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {visible.length > shown && (
          <div className="mt-6 flex justify-center">
            <Button variant="secondary" onClick={() => setShown((value) => value + PAGE)}>
              Show more ({visible.length - shown} left)
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
