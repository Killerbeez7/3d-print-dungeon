import { artistGridClass } from "./ArtistListGrid";

export function ArtistListSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className={artistGridClass} role="status" aria-label="Loading artists">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
          <div className="skeleton-print h-24" />
          <div className="px-4 pb-4">
            <div className="skeleton-print chamfer -mt-9 size-[4.5rem] [--cut:13px]" />
            <div className="skeleton-print mt-3 h-4 w-2/3" />
            <div className="skeleton-print mt-2 h-3 w-1/3" />
            <div className="skeleton-print mt-5 h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
