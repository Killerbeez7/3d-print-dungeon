import { useState } from "react";

interface UploadsChartProps {
  days: { date: Date; count: number }[];
}

const dayLabel = (date: Date) =>
  date.toLocaleDateString("en", { day: "numeric", month: "short" });

/**
 * New listings per day: one series, so one colour and no legend; the title
 * names it. Thin bars anchored to the baseline, a tooltip per bar, and a
 * table for screen readers.
 */
export const UploadsChart = ({ days }: UploadsChartProps) => {
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const hovered = active === null ? null : days[active];

  return (
    <figure className="rounded-xl border border-br-subtle bg-surface-card p-5">
      <figcaption className="flex items-baseline justify-between gap-4">
        <span className="text-sm font-semibold text-txt-primary">
          New listings per day
        </span>
        <span className="label-mono text-txt-muted">
          Last 30 days · {total}
        </span>
      </figcaption>

      {total === 0 ? (
        <div className="bg-buildplate mt-5 flex h-40 items-center justify-center rounded-lg border border-dashed border-br-secondary text-sm text-txt-muted">
          No new listings in the last 30 days.
        </div>
      ) : (
        <div className="relative mt-5" onMouseLeave={() => setActive(null)}>
          {/* Recessive guide: max value line and baseline */}
          <div className="pointer-events-none absolute inset-x-0 top-0 border-t border-dashed border-br-subtle" />
          <span className="label-mono pointer-events-none absolute -top-2.5 right-0 bg-surface-card pl-2 text-[0.65rem] text-txt-muted">
            {max}
          </span>

          <div
            className="flex h-40 items-end gap-[2px] border-b border-br-secondary"
            aria-hidden="true"
          >
            {days.map((day, index) => (
              <button
                key={day.date.toISOString()}
                type="button"
                tabIndex={-1}
                onMouseEnter={() => setActive(index)}
                onFocus={() => setActive(index)}
                className="group flex h-full min-w-0 flex-1 items-end"
              >
                <span
                  className={`w-full rounded-t-[4px] transition-colors ${
                    active === index ? "bg-accent" : "bg-accent/70"
                  }`}
                  style={{
                    height: day.count
                      ? `${Math.max((day.count / max) * 100, 3)}%`
                      : "0%",
                  }}
                />
              </button>
            ))}
          </div>

          {hovered && active !== null && (
            <div
              className="pointer-events-none absolute top-2 z-10 whitespace-nowrap rounded-md border border-br-secondary bg-surface-elevated px-2.5 py-1.5 text-xs shadow-lg"
              style={{
                left: `${((active + 0.5) / days.length) * 100}%`,
                // Keep the tooltip inside the chart at both ends.
                transform: `translateX(${active < 4 ? "-10%" : active > days.length - 5 ? "-90%" : "-50%"})`,
              }}
            >
              <span className="text-txt-secondary">
                {dayLabel(hovered.date)}
              </span>{" "}
              <span className="font-semibold tabular-nums text-txt-primary">
                {hovered.count}
              </span>
            </div>
          )}

          <div
            className="label-mono mt-2 flex justify-between text-[0.65rem] text-txt-muted"
            aria-hidden="true"
          >
            <span>{dayLabel(days[0].date)}</span>
            <span>Today</span>
          </div>
        </div>
      )}

      <table className="sr-only">
        <caption>New listings per day, last 30 days</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">New listings</th>
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day.date.toISOString()}>
              <td>{dayLabel(day.date)}</td>
              <td>{day.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};
