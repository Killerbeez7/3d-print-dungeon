/**
 * @file ArtistListGrid.tsx
 * @description Displays the grid for an artist list
 * @usedIn ArtistsListPage
 */

import { ArtistCard } from "./ArtistCard";
import { ArtistListGridProps } from "../types/artists";

export function ArtistListGrid({ artists }: ArtistListGridProps) {
    if (artists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-token-16 text-center">
                <div className="bg-bg-surface rounded-token-2xl p-token-8 shadow-token-sm">
                    <div className="w-16 h-16 mx-auto mb-token-4 bg-accent/10 rounded-token-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-token-lg font-semibold text-txt-primary mb-token-2">No Artists Found</h3>
                    <p className="text-txt-secondary text-token-sm">Check back soon as more artists join our community!</p>
                </div>
            </div>
        );
    }
    return (
        <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-token-6 animate-fade-in"
            aria-label="Artists List"
            tabIndex={0}
        >
            {artists.map((artist) => (
                <ArtistCard key={artist.uid} {...artist} />
            ))}
        </div>
    );
}
