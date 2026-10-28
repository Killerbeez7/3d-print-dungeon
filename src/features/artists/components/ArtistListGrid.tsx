import { UsersRound } from "lucide-react";

import { StatePanel } from "@/features/shared/components/StatePanel";
import { ArtistCard } from "./ArtistCard";
import type { ArtistListGridProps } from "../types/artists";

export const artistGridClass =
  "grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5";

export function ArtistListGrid({ artists }: ArtistListGridProps) {
  if (artists.length === 0) {
    return (
      <StatePanel icon={UsersRound} title="No artists found" headingLevel="h2" className="min-h-[40vh]">
        Nobody matches that yet. Try another name.
      </StatePanel>
    );
  }

  return (
    <ul className={artistGridClass} aria-label="Artists">
      {artists.map((artist) => (
        <li key={artist.uid}>
          <ArtistCard {...artist} />
        </li>
      ))}
    </ul>
  );
}
