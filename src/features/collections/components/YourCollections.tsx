import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, Plus } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { ROUTES } from "@/constants/routeConstants";
import { COLLECTION_NAME_MAX, collectionPath } from "../services/collectionsService";
import { useCreateCollection, useFavoriteIds, useModelsByIds, useMyCollections } from "../hooks/useShelf";
import { CollectionCard, CollectionCardSkeleton, shelfGridClass } from "./ShelfParts";

/** The signed-in user's Saved list and collections, at the top of the Collections page. */
export const YourCollections = () => {
  const { currentUser, authReady } = useAuth();
  const { open } = useModal("auth");
  const uid = currentUser?.uid;
  const navigate = useNavigate();

  const favorites = useFavoriteIds(uid);
  const collections = useMyCollections(uid);
  const create = useCreateCollection(uid);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  // One request for every cover: the first four models of Saved and of each collection.
  const coverIds = useMemo(() => {
    if (!favorites.data || !collections.data) return undefined;
    return [
      ...favorites.data.slice(0, 4),
      ...collections.data.flatMap((c) => c.modelIds.slice(-4).reverse()),
    ];
  }, [favorites.data, collections.data]);
  const covers = useModelsByIds(coverIds);
  const byId = useMemo(() => new Map((covers.data ?? []).map((m) => [m.id, m])), [covers.data]);
  const pick = (ids: string[]) => ids.map((id) => byId.get(id));

  if (authReady && !currentUser) {
    return (
      <section className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 lg:px-8" aria-label="Your collections">
        <div className="flex flex-col items-start gap-4 rounded-xl border border-br-subtle bg-surface-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold">Keep what you like</h2>
            <p className="mt-1 text-sm text-txt-secondary">
              Sign in to save models and sort them into your own collections.
            </p>
          </div>
          <Button size="sm" onClick={() => open({ mode: "signin" })}>
            Sign in
          </Button>
        </div>
      </section>
    );
  }

  const loading = !authReady || favorites.isPending || collections.isPending;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    create.mutate(
      { name },
      { onSuccess: (id) => navigate(collectionPath(id)) },
    );
  };

  return (
    <section className="mx-auto max-w-[1600px] px-4 pt-10 sm:px-6 lg:px-8" aria-labelledby="your-collections">
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 id="your-collections" className="text-xl font-bold sm:text-2xl">
          Your collections
        </h2>
        {!creating && !loading && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={buttonClassName({ variant: "ghost", size: "sm", className: "text-accent" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            New collection
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={submit} className="mb-5 flex max-w-md gap-2">
          <label htmlFor="new-collection" className="sr-only">
            Collection name
          </label>
          <input
            id="new-collection"
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => event.key === "Escape" && setCreating(false)}
            maxLength={COLLECTION_NAME_MAX}
            placeholder="e.g. Tavern scene"
            className="h-10 min-w-0 flex-1 rounded-lg border border-br-primary bg-surface-card px-3 text-sm text-txt-primary placeholder:text-txt-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
          />
          <Button type="submit" size="sm" className="h-10" disabled={!name.trim() || create.isPending}>
            Create
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-10" onClick={() => setCreating(false)}>
            Cancel
          </Button>
        </form>
      )}
      {create.isError && <p className="mb-4 text-sm text-error">Couldn&apos;t create the collection. Try again.</p>}

      {loading ? (
        <div className={shelfGridClass}>
          {[0, 1, 2].map((i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>
      ) : favorites.isError || collections.isError ? (
        <p className="rounded-lg border border-dashed border-br-secondary px-4 py-8 text-center text-sm text-txt-secondary">
          Your collections couldn&apos;t load. Refresh to try again.
        </p>
      ) : (
        <div className={shelfGridClass}>
          <CollectionCard
            to={ROUTES.COLLECTIONS_SAVED}
            title="Saved"
            count={favorites.data.length}
            cover={pick(favorites.data.slice(0, 4))}
            icon={<Bookmark className="size-4 shrink-0 fill-accent text-accent" aria-hidden="true" />}
          />
          {collections.data.map((list) => (
            <CollectionCard
              key={list.id}
              to={collectionPath(list.id)}
              title={list.name}
              count={list.modelIds.length}
              cover={pick(list.modelIds.slice(-4).reverse())}
            />
          ))}
          {collections.data.length === 0 && (
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="chamfer flex aspect-square flex-col items-center justify-center gap-2 bg-surface-card p-4 text-center text-sm text-txt-secondary shadow-[inset_0_0_0_1px_var(--br-secondary)] transition-colors [--cut:12px] hover:bg-surface-elevated hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
            >
              <Plus className="size-6 text-accent" aria-hidden="true" />
              Start a collection
              <span className="text-xs text-txt-muted">Group models for a project or a scene</span>
            </button>
          )}
        </div>
      )}
    </section>
  );
};
