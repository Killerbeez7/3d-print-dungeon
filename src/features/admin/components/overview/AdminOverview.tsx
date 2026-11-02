import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  CheckCircle2,
  Eye,
  Flag,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components";
import { formatPrice } from "@/features/models/utils/modelMeta";
import type { ModelData } from "@/features/models/types/model";
import {
  fetchAdminOverview,
  revenueByCurrency,
  toDate,
} from "@/features/admin/services/adminStatsService";
import { AdminSectionHeader } from "../shared/AdminSectionHeader";
import { AdminThumb } from "../shared/AdminThumb";
import { UploadsChart } from "./UploadsChart";

const number = new Intl.NumberFormat("en");

const StatTile = ({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail?: string;
}) => (
  <div className="rounded-xl border border-br-subtle bg-surface-card p-4">
    <p className="label-mono flex items-center gap-2 text-txt-muted">
      <Icon className="size-3.5" aria-hidden="true" />
      {label}
    </p>
    <p className="mt-2 text-2xl font-bold tabular-nums text-txt-primary">{value}</p>
    {detail && <p className="mt-0.5 text-xs text-txt-secondary">{detail}</p>}
  </div>
);

const ModelList = ({
  title,
  models,
  metric,
}: {
  title: string;
  models: ModelData[];
  metric: (model: ModelData) => string;
}) => (
  <section className="rounded-xl border border-br-subtle bg-surface-card">
    <h3 className="border-b border-br-subtle px-5 py-3.5 text-sm font-semibold text-txt-primary">{title}</h3>
    {models.length ? (
      <ul className="divide-y divide-br-subtle">
        {models.map((model) => (
          <li key={model.id}>
            <Link
              to={`/model/${model.id}`}
              className="flex items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/60"
            >
              <AdminThumb url={model.renderPrimaryUrl} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-txt-primary">{model.name}</span>
                <span className="block truncate text-xs text-txt-muted">
                  {model.uploaderDisplayName || "Unknown creator"}
                </span>
              </span>
              <span className="label-mono shrink-0 text-txt-secondary">{metric(model)}</span>
            </Link>
          </li>
        ))}
      </ul>
    ) : (
      <p className="px-5 py-6 text-sm text-txt-muted">Nothing yet.</p>
    )}
  </section>
);

const OverviewSkeleton = () => (
  <div role="status" aria-label="Loading overview" className="space-y-6">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="rounded-xl border border-br-subtle bg-surface-card p-4">
          <div className="skeleton-line h-3 w-20" />
          <div className="skeleton-line mt-3 h-7 w-24" />
        </div>
      ))}
    </div>
    <div className="skeleton-print h-60 rounded-xl" />
  </div>
);

export const AdminOverview = () => {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: fetchAdminOverview,
    staleTime: 2 * 60 * 1000,
  });

  const header = (
    <AdminSectionHeader
      title="Overview"
      description={
        data ? `Updated ${data.loadedAt.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}` : undefined
      }
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
  );

  if (isLoading) {
    return (
      <>
        {header}
        <OverviewSkeleton />
      </>
    );
  }

  if (isError || !data) {
    return (
      <>
        {header}
        <p className="rounded-xl border border-br-subtle bg-surface-card p-6 text-sm text-txt-secondary">
          The overview couldn&apos;t load. Check that your account still has admin access, then refresh.
        </p>
      </>
    );
  }

  const revenue = revenueByCurrency(data.sales);
  const missingPreviews = Math.max(0, data.listings - data.withPreview);
  const attention = [
    {
      show: data.pendingReports > 0,
      icon: Flag,
      text: `${data.pendingReports} report${data.pendingReports === 1 ? "" : "s"} waiting for review`,
      to: "/admin-dashboard/reports",
    },
    {
      show: data.publicOriginals > 0,
      icon: ShieldAlert,
      text: `${data.publicOriginals} listing${data.publicOriginals === 1 ? "" : "s"} still link a public original file`,
      to: "/admin-dashboard/models?filter=public-original",
    },
    {
      show: missingPreviews > 0,
      icon: AlertTriangle,
      text: `${missingPreviews} listing${missingPreviews === 1 ? "" : "s"} without a light 3D preview`,
      to: "/admin-dashboard/models?filter=no-preview",
    },
  ].filter((item) => item.show);

  return (
    <>
      {header}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          icon={Box}
          label="Listings"
          value={number.format(data.listings)}
          detail={`${number.format(data.listingsLast30)} in the last 30 days · ${number.format(data.paidListings)} paid`}
        />
        <StatTile icon={Users} label="Accounts" value={data.users === null ? "—" : number.format(data.users)} />
        <StatTile
          icon={Eye}
          label="Views"
          value={number.format(data.views)}
          detail={`${number.format(data.likes)} likes`}
        />
        <StatTile
          icon={ShoppingBag}
          label="Sales"
          value={number.format(data.sales.length)}
          detail={
            revenue.length
              ? revenue.map((item) => formatPrice(item.total, item.currency)).join(" · ")
              : "No sales yet"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <UploadsChart days={data.uploadsByDay} />

        <section className="rounded-xl border border-br-subtle bg-surface-card p-5">
          <h3 className="text-sm font-semibold text-txt-primary">Needs attention</h3>
          {attention.length ? (
            <ul className="mt-3 space-y-2">
              {attention.map((item) => (
                <li key={item.text}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-3 rounded-lg border border-br-subtle px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary"
                  >
                    <item.icon className="size-4 shrink-0 text-warning" aria-hidden="true" />
                    <span className="min-w-0 flex-1">{item.text}</span>
                    <ArrowRight
                      className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 flex items-center gap-2 text-sm text-txt-secondary">
              <CheckCircle2 className="size-4 text-success" aria-hidden="true" />
              All clear.
            </p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <ModelList
          title="Most viewed"
          models={data.topModels}
          metric={(model) => `${number.format(model.views ?? 0)} views`}
        />
        <ModelList
          title="Newest listings"
          models={data.recentModels}
          metric={(model) =>
            toDate(model.createdAt)?.toLocaleDateString("en", { day: "numeric", month: "short" }) ?? ""
          }
        />
        <section className="rounded-xl border border-br-subtle bg-surface-card">
          <h3 className="border-b border-br-subtle px-5 py-3.5 text-sm font-semibold text-txt-primary">
            Recent sales
          </h3>
          {data.sales.length ? (
            <ul className="divide-y divide-br-subtle">
              {data.sales.slice(0, 6).map((sale) => (
                <li key={sale.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="min-w-0">
                    {sale.modelId ? (
                      <Link to={`/model/${sale.modelId}`} className="block truncate text-txt-primary hover:underline">
                        {sale.modelName ?? "View model"}
                      </Link>
                    ) : (
                      <span className="text-txt-primary">Sale</span>
                    )}
                    <span className="block text-xs text-txt-muted">
                      {sale.purchasedAt?.toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </span>
                  <span className="label-mono shrink-0 text-txt-primary">
                    {formatPrice(sale.amount, sale.currency)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-6 text-sm text-txt-muted">No sales yet.</p>
          )}
        </section>
      </div>
    </>
  );
};
