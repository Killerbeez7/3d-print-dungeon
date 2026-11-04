import { useCallback, useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bookmark, Check, Plus } from "lucide-react";

import { buttonClassName } from "@/components";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { CurrentUser } from "@/features/auth/types/auth";
import {
  useCreateCollection,
  useFavoriteIds,
  useMyCollections,
  useSetModelInCollection,
  useToggleFavorite,
} from "@/features/collections/hooks/useShelf";
import { COLLECTION_NAME_MAX } from "@/features/collections/services/collectionsService";
import { ROUTES } from "@/constants/routeConstants";

export interface FavoritesButtonProps {
  modelId: string;
  currentUser: CurrentUser | null;
  openAuthModal?: () => void;
}

const rowClass =
  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus";

const Tick = ({ on }: { on: boolean }) => (
  <span
    className={`flex size-5 shrink-0 items-center justify-center rounded border transition-colors ${
      on ? "border-accent bg-accent text-btn-primary-text" : "border-br-primary bg-surface-card"
    }`}
    aria-hidden="true"
  >
    {on && <Check className="size-3.5" strokeWidth={3} />}
  </span>
);

/**
 * "Save": the first tap puts the model in Saved and opens a small panel to also add it to
 * any of your collections, or start a new one.
 */
export const FavoritesButton = ({ modelId, currentUser, openAuthModal }: FavoritesButtonProps) => {
  const uid = currentUser?.uid;
  const favorites = useFavoriteIds(uid);
  const collections = useMyCollections(uid);
  const toggleFavorite = useToggleFavorite(uid);
  const setInCollection = useSetModelInCollection(uid);
  const createCollection = useCreateCollection(uid);

  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const panelId = useId();

  const inSaved = favorites.data?.includes(modelId) ?? false;
  const inLists = (collections.data ?? []).filter((c) => c.modelIds.includes(modelId));
  const saved = inSaved || inLists.length > 0;

  const close = useCallback(() => {
    setOpen(false);
    setCreating(false);
    setName("");
  }, []);
  useClickOutside(wrapRef as RefObject<HTMLElement>, () => open && close());

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  const handleClick = () => {
    if (!currentUser) {
      openAuthModal?.();
      return;
    }
    if (open) {
      close();
      return;
    }
    // One tap saves; the panel is there for collections.
    if (!saved && favorites.isSuccess) toggleFavorite.mutate(modelId);
    setOpen(true);
  };

  const submitNew = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    createCollection.mutate(
      { name, modelId },
      {
        onSuccess: () => {
          setCreating(false);
          setName("");
        },
      },
    );
  };

  return (
    <div ref={wrapRef} className="relative flex-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={Boolean(uid) && favorites.isPending}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        className={buttonClassName({
          variant: "secondary",
          className: `w-full ${saved ? "[--btn-edge:var(--accent)]" : ""}`,
        })}
      >
        <Bookmark className={`size-4 ${saved ? "fill-accent text-accent" : ""}`} aria-hidden="true" />
        <span>{saved ? "Saved" : "Save"}</span>
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Save to"
          className="absolute left-1/2 top-full z-40 mt-2 w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-xl border border-br-secondary bg-surface-elevated p-1.5 shadow-popover"
        >
          <p className="label-mono px-2.5 pb-1 pt-2 text-txt-muted">Save to</p>

          <button
            type="button"
            role="checkbox"
            aria-checked={inSaved}
            onClick={() => toggleFavorite.mutate(modelId)}
            className={rowClass}
          >
            <Tick on={inSaved} />
            <span className="flex-1 font-medium text-txt-primary">Saved</span>
            <Bookmark className="size-4 text-txt-muted" aria-hidden="true" />
          </button>

          <div className="max-h-56 overflow-y-auto">
            {(collections.data ?? []).map((list) => {
              const on = list.modelIds.includes(modelId);
              return (
                <button
                  key={list.id}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => setInCollection.mutate({ id: list.id, modelId, included: !on })}
                  className={rowClass}
                >
                  <Tick on={on} />
                  <span className="min-w-0 flex-1 truncate text-txt-primary">{list.name}</span>
                  <span className="font-mono text-xs text-txt-muted">{list.modelIds.length}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-1 border-t border-br-subtle pt-1">
            {creating ? (
              <form onSubmit={submitNew} className="flex gap-1.5 p-1.5">
                <label htmlFor={`${panelId}-name`} className="sr-only">
                  Collection name
                </label>
                <input
                  id={`${panelId}-name`}
                  ref={inputRef}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={COLLECTION_NAME_MAX}
                  placeholder="e.g. Goblin warband"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-br-primary bg-surface-card px-2.5 text-sm text-txt-primary placeholder:text-txt-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
                />
                <button
                  type="submit"
                  disabled={!name.trim() || createCollection.isPending}
                  className={buttonClassName({ size: "sm", className: "h-9" })}
                >
                  Create
                </button>
              </form>
            ) : (
              <button type="button" onClick={() => setCreating(true)} className={rowClass}>
                <span className="flex size-5 items-center justify-center text-accent" aria-hidden="true">
                  <Plus className="size-4" />
                </span>
                <span className="font-medium text-txt-primary">New collection</span>
              </button>
            )}
            {createCollection.isError && (
              <p className="px-2.5 pb-1 text-xs text-error">Couldn&apos;t create it. Try again.</p>
            )}
            <Link
              to={ROUTES.COLLECTIONS}
              className="group flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-accent hover:bg-muted"
            >
              Your collections
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
