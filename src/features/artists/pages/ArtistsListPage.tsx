import { useDeferredValue, useMemo, useState } from "react";
import { RefreshCw, Search, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { ArtistListGrid } from "../components/ArtistListGrid";
import { ArtistListSkeleton } from "../components/ArtistListSkeleton";
import { useFetchArtists } from "../hooks/useFetchArtists";
import { filterArtists, sortArtists, type ArtistSort } from "../services/artistDirectory";

const PAGE = 24;

const SORTS: Record<ArtistSort, string> = {
  models: "Most models",
  recent: "Recently active",
  followers: "Most followers",
  name: "Name A–Z",
};

export const ArtistsListPage = () => {
  const { data: artists = [], isPending, isError, refetch, isRefetching } = useFetchArtists();
  const [term, setTerm] = useState("");
  const [sort, setSort] = useState<ArtistSort>("models");
  const [shown, setShown] = useState(PAGE);
  const deferredTerm = useDeferredValue(term);

  const visible = useMemo(
    () => filterArtists(sortArtists(artists, sort), deferredTerm),
    [artists, sort, deferredTerm],
  );

  return (
    <div className="min-h-screen bg-page pb-16">
      <PageHeader
        eyebrow="Community"
        title="Artists"
        description="The creators sharing models on 3D Print Dungeon. Open a profile to see their work."
        aside={
          artists.length > 0 && (
            <p className="font-mono text-sm text-txt-muted">
              <span className="text-2xl font-semibold text-txt-primary">{artists.length}</span>{" "}
              {artists.length === 1 ? "artist" : "artists"}
            </p>
          )
        }
      >
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1 sm:max-w-md">
            <span className="sr-only">Search artists</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-txt-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={term}
              onChange={(event) => {
                setTerm(event.target.value);
                setShown(PAGE);
              }}
              placeholder="Search by name or bio"
              className="h-10 w-full rounded-lg border border-br-input bg-surface-card pl-9 pr-9 text-sm text-txt-primary placeholder:text-txt-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus [&::-webkit-search-cancel-button]:hidden"
            />
            {term && (
              <button
                type="button"
                onClick={() => setTerm("")}
                aria-label="Clear search"
                className="absolute right-1.5 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-txt-muted hover:bg-muted hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-focus"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            )}
          </label>
          <label>
            <span className="sr-only">Sort artists</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as ArtistSort)}
              className="h-10 w-full rounded-lg border border-br-input bg-surface-card px-2.5 text-sm text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus sm:w-auto"
            >
              {Object.entries(SORTS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-[1600px] px-4 pt-6 sm:px-6 lg:px-8">
        {isPending ? (
          <ArtistListSkeleton />
        ) : isError ? (
          <StatePanel
            icon={TriangleAlert}
            title="Couldn't load artists"
            headingLevel="h2"
            className="min-h-[40vh]"
            actions={
              <Button
                onClick={() => void refetch()}
                disabled={isRefetching}
                leftIcon={<RefreshCw className="size-4" aria-hidden="true" />}
              >
                Try again
              </Button>
            }
          >
            Check your connection and try again.
          </StatePanel>
        ) : (
          <>
            {deferredTerm.trim() && visible.length > 0 && (
              <p className="mb-4 text-sm text-txt-secondary" aria-live="polite">
                {visible.length} {visible.length === 1 ? "match" : "matches"}
              </p>
            )}
            <ArtistListGrid artists={visible.slice(0, shown)} />
            {visible.length > shown && (
              <div className="mt-8 flex justify-center">
                <Button variant="secondary" onClick={() => setShown((value) => value + PAGE)}>
                  Show more ({visible.length - shown} left)
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
