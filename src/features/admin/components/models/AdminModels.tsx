import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Pencil, RefreshCw, Search, Trash2 } from "lucide-react";

import { Button } from "@/components";
import { formatPrice } from "@/features/models/utils/modelMeta";
import type { ModelData } from "@/features/models/types/model";
import { fetchAdminModels, toDate } from "@/features/admin/services/adminStatsService";
import { AdminSectionHeader } from "../shared/AdminSectionHeader";
import { AdminThumb } from "../shared/AdminThumb";

type AdminModel = ModelData & { previewVersion?: number };

const FILTERS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "free", label: "Free" },
  { id: "no-preview", label: "No light preview" },
  { id: "public-original", label: "Public original" },
] as const;
type FilterId = (typeof FILTERS)[number]["id"];

const SORTS = {
  newest: { label: "Newest", compare: (a: AdminModel, b: AdminModel) => time(b) - time(a) },
  oldest: { label: "Oldest", compare: (a: AdminModel, b: AdminModel) => time(a) - time(b) },
  views: { label: "Most viewed", compare: (a: AdminModel, b: AdminModel) => (b.views ?? 0) - (a.views ?? 0) },
  likes: { label: "Most liked", compare: (a: AdminModel, b: AdminModel) => (b.likes ?? 0) - (a.likes ?? 0) },
  price: { label: "Highest price", compare: (a: AdminModel, b: AdminModel) => price(b) - price(a) },
} as const;
type SortId = keyof typeof SORTS;

const PAGE = 50;

function time(model: AdminModel) {
  return toDate(model.createdAt)?.getTime() ?? 0;
}
function price(model: AdminModel) {
  return model.isPaid ? (model.price ?? 0) : 0;
}

const hasPreview = (model: AdminModel) => (model.previewVersion ?? 0) >= 1;
const hasPublicOriginal = (model: AdminModel) => Boolean(model.originalFileUrl);

const matchesFilter = (model: AdminModel, filter: FilterId) => {
  switch (filter) {
    case "paid":
      return Boolean(model.isPaid && model.price);
    case "free":
      return !(model.isPaid && model.price);
    case "no-preview":
      return !hasPreview(model);
    case "public-original":
      return hasPublicOriginal(model);
    default:
      return true;
  }
};

const StatusBadges = ({ model }: { model: AdminModel }) => (
  <span className="flex flex-wrap gap-1">
    {hasPreview(model) ? (
      <span className="label-mono rounded bg-success/12 px-1.5 py-0.5 text-[0.65rem] text-success">Light preview</span>
    ) : model.convertedFileUrl ? (
      <span className="label-mono rounded bg-warning/12 px-1.5 py-0.5 text-[0.65rem] text-warning">Full viewer file</span>
    ) : (
      <span className="label-mono rounded bg-muted px-1.5 py-0.5 text-[0.65rem] text-txt-muted">No 3D</span>
    )}
    {hasPublicOriginal(model) && (
      <span className="label-mono rounded bg-error/12 px-1.5 py-0.5 text-[0.65rem] text-error">Public original</span>
    )}
  </span>
);

const priceLabel = (model: AdminModel) =>
  model.isPaid && model.price ? formatPrice(model.price, model.currency) : "Free";

const dateLabel = (model: AdminModel) =>
  toDate(model.createdAt)?.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) ?? "—";

export const AdminModels = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = (FILTERS.find((item) => item.id === searchParams.get("filter"))?.id ?? "all") as FilterId;
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortId>("newest");
  const [shown, setShown] = useState(PAGE);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const { data: models = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "models"],
    queryFn: () => fetchAdminModels() as Promise<AdminModel[]>,
    staleTime: 60 * 1000,
  });

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return models
      .filter((model) => matchesFilter(model, filter))
      .filter(
        (model) =>
          !needle ||
          model.name?.toLowerCase().includes(needle) ||
          model.uploaderDisplayName?.toLowerCase().includes(needle) ||
          model.id.toLowerCase().includes(needle)
      )
      .sort(SORTS[sort].compare);
  }, [models, filter, search, sort]);

  const counts = useMemo(
    () => Object.fromEntries(FILTERS.map((item) => [item.id, models.filter((model) => matchesFilter(model, item.id)).length])),
    [models]
  );

  const setFilter = (id: FilterId) => {
    setSearchParams(id === "all" ? {} : { filter: id }, { replace: true, preventScrollReset: true });
    setShown(PAGE);
    setSelected(new Set());
  };

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const page = visible.slice(0, shown);
  const allOnPageSelected = page.length > 0 && page.every((model) => selected.has(model.id));
  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      for (const model of page) {
        if (allOnPageSelected) next.delete(model.id);
        else next.add(model.id);
      }
      return next;
    });

  const deleteSelected = async () => {
    setDeleting(true);
    setMessage(null);
    const { deleteModel } = await import("@/features/models/services/modelsService");
    const ids = [...selected];
    const results = await Promise.allSettled(ids.map((id) => deleteModel(id)));
    const failed = results.filter((result) => result.status === "rejected").length;
    const done = ids.length - failed;
    setDeleting(false);
    setConfirming(false);
    setSelected(new Set());
    setMessage(
      failed
        ? { tone: "error", text: `Deleted ${done}; ${failed} couldn't be deleted. Try those again.` }
        : { tone: "success", text: `Deleted ${done} listing${done === 1 ? "" : "s"} and their files.` }
    );
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
    await queryClient.invalidateQueries({ queryKey: ["models"] });
  };

  return (
    <>
      <AdminSectionHeader
        title="Models"
        description={isLoading ? "Loading listings…" : `${models.length} listings`}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void refetch()}
            disabled={isFetching}
            leftIcon={<RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} aria-hidden="true" />}
          >
            Refresh
          </Button>
        }
      />

      {/* Toolbar: filters, search, sort in one row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]" role="group" aria-label="Filter listings">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
                filter === item.id
                  ? "border-accent bg-accent-soft text-txt-primary"
                  : "border-br-subtle text-txt-secondary hover:border-br-primary hover:text-txt-primary"
              }`}
            >
              {item.label}
              {!isLoading && <span className="label-mono text-[0.65rem] text-txt-muted">{counts[item.id]}</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-2 lg:ml-auto">
          <label className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
            <span className="sr-only">Search listings</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setShown(PAGE);
              }}
              placeholder="Name, creator or ID"
              className="h-9 w-full rounded-lg border border-br-input bg-surface-card pl-9 pr-3 text-sm text-txt-primary placeholder:text-txt-muted"
            />
          </label>
          <label className="shrink-0">
            <span className="sr-only">Sort by</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortId)}
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

      {message && (
        <p
          role="status"
          className={`mt-4 rounded-lg border px-4 py-2.5 text-sm ${
            message.tone === "success" ? "border-success/40 text-success" : "border-error/40 text-error"
          }`}
        >
          {message.text}
        </p>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="sticky top-16 z-20 mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-br-secondary bg-surface-elevated px-4 py-2.5 shadow-lg">
          {confirming ? (
            <>
              <p className="text-sm text-txt-primary">
                Delete {selected.size} listing{selected.size === 1 ? "" : "s"}? Their files are deleted too, and
                buyers lose access. This can&apos;t be undone.
              </p>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={() => void deleteSelected()} isLoading={deleting}>
                  Delete
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-txt-primary">{selected.size} selected</p>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelected(new Set())}>
                  Clear
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirming(true)}
                  leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
                >
                  Delete
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
        {isLoading ? (
          <div role="status" aria-label="Loading listings" className="divide-y divide-br-subtle">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-3">
                <div className="skeleton-print chamfer size-10 shrink-0 [--cut:6px]" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton-line h-4 w-1/3" />
                  <div className="skeleton-line h-3 w-1/5" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="p-6 text-sm text-txt-secondary">The listings couldn&apos;t load. Refresh to try again.</p>
        ) : visible.length === 0 ? (
          <p className="p-6 text-sm text-txt-secondary">No listings match.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="hidden border-b border-br-subtle text-txt-muted md:table-header-group">
              <tr className="label-mono text-[0.7rem]">
                <th scope="col" className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleAll}
                    aria-label="Select all shown"
                    className="size-4 accent-[var(--accent)]"
                  />
                </th>
                <th scope="col" className="py-3 pr-4 font-normal">Listing</th>
                <th scope="col" className="py-3 pr-4 font-normal">Status</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">Price</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">Views</th>
                <th scope="col" className="hidden py-3 pr-4 text-right font-normal lg:table-cell">Likes</th>
                <th scope="col" className="hidden py-3 pr-4 font-normal lg:table-cell">Added</th>
                <th scope="col" className="py-3 pr-4 text-right font-normal">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-br-subtle">
              {page.map((model) => (
                <tr
                  key={model.id}
                  className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:table-row md:p-0 ${
                    selected.has(model.id) ? "bg-accent-soft/40" : "hover:bg-muted/40"
                  }`}
                >
                  <td className="md:px-4 md:py-2.5">
                    <input
                      type="checkbox"
                      checked={selected.has(model.id)}
                      onChange={() => toggle(model.id)}
                      aria-label={`Select ${model.name}`}
                      className="size-4 accent-[var(--accent)]"
                    />
                  </td>
                  <td className="min-w-0 flex-1 md:py-2.5 md:pr-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <AdminThumb url={model.renderPrimaryUrl} />
                      <div className="min-w-0">
                        <Link
                          to={`/model/${model.id}`}
                          className="block truncate font-medium text-txt-primary hover:underline"
                        >
                          {model.name}
                        </Link>
                        <p className="truncate text-xs text-txt-muted">
                          {model.uploaderDisplayName || "Unknown creator"}
                          <span className="md:hidden"> · {priceLabel(model)} · {model.views ?? 0} views</span>
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="w-full md:w-auto md:py-2.5 md:pr-4">
                    <StatusBadges model={model} />
                  </td>
                  <td className="hidden py-2.5 pr-4 text-right tabular-nums text-txt-secondary md:table-cell">
                    {priceLabel(model)}
                  </td>
                  <td className="hidden py-2.5 pr-4 text-right tabular-nums text-txt-secondary md:table-cell">
                    {(model.views ?? 0).toLocaleString("en")}
                  </td>
                  <td className="hidden py-2.5 pr-4 text-right tabular-nums text-txt-secondary lg:table-cell">
                    {(model.likes ?? 0).toLocaleString("en")}
                  </td>
                  <td className="hidden whitespace-nowrap py-2.5 pr-4 text-txt-secondary lg:table-cell">
                    {dateLabel(model)}
                  </td>
                  <td className="ml-auto md:py-2.5 md:pr-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        to={`/model/${model.id}`}
                        className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
                        aria-label={`Open ${model.name}`}
                        title="Open"
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </Link>
                      <Link
                        to={`/model/${model.id}/edit`}
                        className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
                        aria-label={`Edit ${model.name}`}
                        title="Edit"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(new Set([model.id]));
                          setConfirming(true);
                        }}
                        className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-error/10 hover:text-error"
                        aria-label={`Delete ${model.name}`}
                        title="Delete"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {visible.length > shown && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => setShown((value) => value + PAGE)}>
            Show more ({visible.length - shown} left)
          </Button>
        </div>
      )}
    </>
  );
};
