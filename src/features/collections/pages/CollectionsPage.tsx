import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { ROUTES } from "@/constants/routeConstants";
import { HomeModelsGrid, HomeModelsGridSkeleton } from "@/features/home/components/HomeModelsGrid";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";
import { useRisingModels } from "@/features/rising-models/hooks/useRisingModels";
import { PageHeader } from "@/features/shared/components/PageHeader";

const PREVIEW_COUNT = 7;

const SectionHeading = ({ title, link }: { title: string; link?: { to: string; label: string } }) => (
  <div className="mb-4 flex items-end justify-between gap-4 px-3 sm:px-5 lg:px-7">
    <h2 className="text-xl font-bold sm:text-2xl">{title}</h2>
    {link && (
      <Link
        to={link.to}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
      >
        {link.label}
        <ArrowRight
          className="size-4 transition-transform duration-300 ease-forge group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>
    )}
  </div>
);

export const CollectionsPage = () => {
  const { data: rising = [], isPending, isError } = useRisingModels(30);

  return (
    <div className="min-h-screen bg-page pb-16">
      <PageHeader
        eyebrow="Collections"
        title="Browse the vault"
        description="This month's rising uploads and every category, in one place."
      />

      {/* Hidden when nothing was uploaded this month */}
      {(isPending || isError || rising.length > 0) && (
        <section className="px-1 pt-10" aria-label="Rising this month">
          <SectionHeading
            title="Rising this month"
            link={{ to: ROUTES.COLLECTIONS_RISING, label: "See all" }}
          />
          {isPending ? (
            <HomeModelsGridSkeleton count={PREVIEW_COUNT} />
          ) : isError ? (
            <p className="mx-3 rounded-lg border border-dashed border-br-secondary px-4 py-8 text-center text-sm text-txt-secondary sm:mx-5 lg:mx-7">
              Rising models couldn&apos;t load. Refresh to try again.
            </p>
          ) : (
            <HomeModelsGrid models={rising.slice(0, PREVIEW_COUNT)} />
          )}
        </section>
      )}

      <section className="px-1 pt-14" aria-label="Categories">
        <SectionHeading title="Categories" />
        <ul className="grid grid-cols-2 gap-1 lg:grid-cols-4">
          {MODEL_CATEGORIES.map((category, index) => (
            <li key={category.id}>
              <Link
                to={`${ROUTES.HOME}?category=${category.id}`}
                className="bg-buildplate group relative flex h-full min-h-28 flex-col justify-between gap-6 overflow-hidden bg-surface-card p-4 sm:min-h-36 sm:p-5 transition-colors hover:bg-surface-elevated"
              >
                <span className="tile-scan pointer-events-none absolute inset-0" aria-hidden="true" />
                <span className="flex items-start justify-between">
                  <span className="font-mono text-xs text-txt-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    className="size-5 text-txt-muted transition-[color,transform] duration-300 ease-forge group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                    aria-hidden="true"
                  />
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-txt-primary sm:text-lg">
                    {category.name}
                  </span>
                  <span className="mt-1 line-clamp-2 text-sm text-txt-secondary max-sm:hidden">
                    {category.description}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
