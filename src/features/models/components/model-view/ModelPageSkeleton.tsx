/** Loading layout for the model page, matching its real structure. */
export const ModelPageSkeleton = () => {
  return (
    <div
      className="mx-auto max-w-[1600px] px-3 pt-4 sm:px-6 lg:px-8"
      role="status"
      aria-label="Loading model"
    >
      <div className="skeleton-print mb-4 h-3 w-48" />
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="skeleton-print h-[52vh] rounded-lg lg:h-[calc(100vh-15rem)]" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="skeleton-print chamfer size-16 [--cut:8px] lg:size-20" />
            ))}
          </div>
        </div>
        <div className="w-full space-y-5 lg:w-[400px]">
          <div className="skeleton-print h-3 w-24" />
          <div className="skeleton-print h-9 w-4/5" />
          <div className="flex items-center gap-3">
            <div className="skeleton-print chamfer size-12 [--cut:9px]" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-print h-4 w-2/5" />
              <div className="skeleton-print h-3 w-1/4" />
            </div>
          </div>
          <div className="skeleton-print h-16" />
          <div className="skeleton-print chamfer h-12 [--cut:11px]" />
          <div className="skeleton-print h-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
