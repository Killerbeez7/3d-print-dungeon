/** Loading layout for the settings page, matching its real structure. */
export const SettingsPageSkeleton = () => {
  return (
    <div
      className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading settings"
    >
      <div className="mb-8 space-y-3">
        <div className="skeleton-line h-3 w-24" />
        <div className="skeleton-line h-8 w-40" />
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <aside className="md:w-64 md:shrink-0">
          <div className="hidden items-center gap-3 border-b border-br-subtle pb-5 md:flex">
            <div className="skeleton-print chamfer size-12 shrink-0 [--cut:9px]" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-line h-4 w-3/4" />
              <div className="skeleton-line h-3 w-1/2" />
            </div>
          </div>
          <div className="flex gap-2 md:mt-4 md:flex-col">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="skeleton-line h-10 w-28 shrink-0 md:w-full"
                style={{ ["--skeleton-delay" as string]: `${index * 80}ms` }}
              />
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 space-y-6">
          {Array.from({ length: 2 }, (_, card) => (
            <div key={card} className="rounded-xl border border-br-subtle bg-surface-card p-6">
              <div className="skeleton-line h-5 w-1/4" />
              <div className="mt-6 space-y-5">
                {Array.from({ length: 3 }, (_, row) => (
                  <div key={row} className="flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="skeleton-line h-4 w-1/3" />
                      <div className="skeleton-line h-3 w-2/3" />
                    </div>
                    <div className="skeleton-line h-9 w-24" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
