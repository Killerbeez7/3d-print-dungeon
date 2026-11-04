import { useEffect, useState } from "react";
import { Ruler } from "lucide-react";

import { useModelLoader } from "@/features/models/hooks/useModelLoader";
import { glbMeshStats, PLA_DENSITY, type MeshStats } from "@/features/models/utils/meshStats";

const mm = (value: number) =>
  (value >= 100 ? value.toFixed(0) : value.toFixed(1)).replace(/\.0$/, "");
const amount = (value: number) => (value >= 10 ? value.toFixed(0) : value.toFixed(1));

/** A 28 mm scale figure (eye height 28 mm, about 32 mm to the top of the head) on a 25 mm base. */
const FIGURE = { height: 32, base: 25, baseHeight: 3 };

/** Front view of the model's bounding box next to the 28 mm figure, both to scale. */
const ScaleCheck = ({ width, height }: { width: number; height: number }) => {
  const viewHeight = 96;
  const gap = 8;
  const unitsWide = width + gap + FIGURE.base;
  const unitsTall = Math.max(height, FIGURE.height + FIGURE.baseHeight);
  const k = Math.min(viewHeight / unitsTall, 260 / unitsWide);
  const floor = viewHeight;
  const fx = (width + gap) * k; // figure's left edge
  const fw = FIGURE.base * k;
  const fh = FIGURE.height * k;
  const bh = FIGURE.baseHeight * k;
  const cx = fx + fw / 2;
  const headR = Math.max(fh * 0.09, 1.5);

  return (
    <svg
      viewBox={`-2 -2 ${unitsWide * k + 4} ${viewHeight + 4}`}
      className="h-24 w-full"
      role="img"
      aria-label={`Model ${mm(height)} mm tall next to a 28 mm scale figure`}
    >
      <rect
        x={0}
        y={floor - height * k}
        width={Math.max(width * k, 1)}
        height={Math.max(height * k, 1)}
        rx={2}
        className="fill-accent/15 stroke-accent"
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
      />
      <g className="fill-txt-muted">
        <rect x={fx} y={floor - bh} width={fw} height={bh} rx={bh / 2} />
        <circle cx={cx} cy={floor - bh - fh + headR} r={headR} />
        <path
          d={`M${cx - fh * 0.13} ${floor - bh - fh + headR * 2.3}
              h${fh * 0.26} l${fh * 0.05} ${fh * 0.42} h-${fh * 0.07} l-${fh * 0.02} ${fh * 0.4}
              h-${fh * 0.1} l-${fh * 0.01} -${fh * 0.3} l-${fh * 0.01} ${fh * 0.3} h-${fh * 0.1}
              l-${fh * 0.02} -${fh * 0.4} h-${fh * 0.07} Z`}
        />
      </g>
    </svg>
  );
};

/**
 * Print details measured from the model's 3D preview: size, volume and a scale check against
 * a 28 mm figure. Shares the download with the 3D viewer; "Measure" starts it if needed.
 */
export const PrintDetails = ({ url }: { url?: string }) => {
  const { status, progress, markLoading, getBlob } = useModelLoader(url ?? "");
  const [stats, setStats] = useState<MeshStats | null | undefined>(undefined);

  useEffect(() => {
    if (status !== "loaded") return;
    const blob = getBlob();
    if (!blob) return;
    let cancelled = false;
    blob
      .arrayBuffer()
      .then((buffer) => !cancelled && setStats(glbMeshStats(buffer)))
      .catch(() => !cancelled && setStats(null));
    return () => {
      cancelled = true;
    };
  }, [status, getBlob]);

  if (!url) return null;

  const [width, height, depth] = stats?.size ?? [0, 0, 0];
  const cm3 = (stats?.volume ?? 0) / 1000;
  const unusualUnits =
    stats && (Math.max(width, height, depth) < 3 || Math.max(width, height, depth) > 3000);

  return (
    <section>
      <h2 className="label-mono mb-2 text-txt-muted">Print details</h2>
      <div className="rounded-lg border border-br-subtle bg-surface-card">
        {stats === undefined ? (
          <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="text-txt-secondary">Size, volume and a 28 mm scale check</span>
            <button
              type="button"
              onClick={markLoading}
              disabled={status === "loading"}
              className="flex shrink-0 items-center gap-1.5 rounded-md border border-br-secondary px-3 py-1.5 font-medium text-txt-primary transition-colors hover:border-accent disabled:cursor-wait"
            >
              <Ruler className="size-4" aria-hidden="true" />
              {status === "loading" ? `Measuring ${Math.round(progress * 100)}%` : "Measure"}
            </button>
          </div>
        ) : stats === null ? (
          <p className="px-4 py-3 text-sm text-txt-secondary">
            This model&apos;s file couldn&apos;t be measured.
          </p>
        ) : (
          <>
            <dl className="divide-y divide-br-subtle">
              <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <dt className="text-txt-muted">Size (W × D × H)</dt>
                <dd className="font-mono text-txt-primary">
                  {mm(width)} × {mm(depth)} × {mm(height)} mm
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                <dt className="text-txt-muted">Volume</dt>
                <dd className="font-mono text-txt-primary">
                  {cm3 > 0 ? `≈ ${amount(cm3)} cm³` : "Not a closed shape"}
                </dd>
              </div>
              {cm3 > 0 && (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm">
                  <dt className="text-txt-muted">Material, printed solid</dt>
                  <dd className="text-right font-mono text-txt-primary">
                    ≈ {amount(cm3)} ml resin · {amount(cm3 * PLA_DENSITY)} g PLA
                  </dd>
                </div>
              )}
            </dl>
            <div className="border-t border-br-subtle px-4 pb-3 pt-2">
              <ScaleCheck width={width} height={height} />
              <p className="mt-1 text-xs text-txt-muted">
                Front view to scale, next to a 28 mm figure.{" "}
                {unusualUnits
                  ? "The file's units look unusual, so these sizes may be off."
                  : "Measured from the 3D preview, assuming the file is in millimetres; hollowing and infill use less material."}
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};
