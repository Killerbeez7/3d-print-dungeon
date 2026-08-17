/**
 * @file ArtistListSkeleton.tsx
 * @description Displays the skeleton for an artist list
 * @usedIn ArtistsListPage
 */

export function ArtistListSkeleton() {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 animate-pulse"
      aria-label="Loading artists..."
    >
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden bg-surface-card">
          <div className="w-full aspect-square bg-section"></div>
          <div className="p-3">
            <div className="h-5 w-3/4 mb-2 bg-section rounded"></div>
            <div className="h-4 w-1/2 bg-section rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
