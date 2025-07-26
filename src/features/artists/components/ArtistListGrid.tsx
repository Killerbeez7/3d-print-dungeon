import { ArtistCard } from "./ArtistCard";
import { ArtistListGridProps } from "../types/artists";

export function ArtistListGrid({ artists }: ArtistListGridProps) {
    if (artists.length === 0) {
        return <p className="text-lg text-txt-secondary">No artists found.</p>;
    }
    return (
        <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-2 animate-fade-in"
            aria-label="Artists List"
            tabIndex={0}
        >
            {artists.map((artist) => (
                <ArtistCard key={artist.uid} {...artist} />
            ))}
        </div>
    );
}
