import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderX, Layers, LogIn, Pencil, Trash2 } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { HomeModelsGridSkeleton } from "@/features/home/components/HomeModelsGrid";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { ROUTES } from "@/constants/routeConstants";
import { COLLECTION_NAME_MAX } from "../services/collectionsService";
import {
  useDeleteCollection,
  useModelsByIds,
  useMyCollections,
  useRenameCollection,
  useSetModelInCollection,
} from "../hooks/useShelf";
import { ShelfModels } from "../components/ShelfParts";

/** One of the user's own collections. Private: only its owner can open it. */
export const CollectionDetailsPage = () => {
  const { collectionId = "" } = useParams<{ collectionId: string }>();
  const navigate = useNavigate();
  const { currentUser, authReady } = useAuth();
  const { open } = useModal("auth");
  const uid = currentUser?.uid;

  const collections = useMyCollections(uid);
  const list = collections.data?.find((c) => c.id === collectionId);
  // Newest additions first.
  const ids = list ? list.modelIds.slice().reverse() : undefined;
  const models = useModelsByIds(ids);
  const rename = useRenameCollection(uid);
  const remove = useDeleteCollection(uid);
  const setInCollection = useSetModelInCollection(uid);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (authReady && !currentUser) {
    return (
      <StatePanel
        icon={LogIn}
        title="Sign in to see this collection"
        actions={<Button onClick={() => open({ mode: "signin" })}>Sign in</Button>}
      >
        Collections are private to the account that made them.
      </StatePanel>
    );
  }

  if (!authReady || collections.isPending) {
    return (
      <div className="min-h-screen bg-page pb-16" role="status" aria-label="Loading collection">
        <div className="border-b border-br-subtle bg-section px-4 pb-8 pt-14 sm:px-6 lg:px-8">
          <div className="skeleton-line h-3 w-24" />
          <div className="skeleton-line mt-4 h-10 w-72 max-w-full" />
        </div>
        <div className="px-1 pt-6">
          <HomeModelsGridSkeleton count={7} />
        </div>
      </div>
    );
  }

  if (collections.isError || !list) {
    return (
      <StatePanel
        icon={FolderX}
        title={collections.isError ? "Couldn't load this collection" : "Collection not found"}
        actions={
          <Link to={ROUTES.COLLECTIONS} className={buttonClassName()}>
            Your collections
          </Link>
        }
      >
        {collections.isError
          ? "Check your connection and refresh the page."
          : "It may have been deleted, or it belongs to another account."}
      </StatePanel>
    );
  }

  const shown = (models.data ?? []).filter((m) => list.modelIds.includes(m.id));
  const loadingModels = models.isPending && list.modelIds.length > 0;

  const submitRename = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    rename.mutate({ id: list.id, name });
    setEditing(false);
  };

  const handleDelete = () => {
    remove.mutate({ id: list.id }, { onSuccess: () => navigate(ROUTES.COLLECTIONS) });
  };

  return (
    <div className="min-h-screen bg-page pb-16">
      <PageHeader
        eyebrow="Your collection"
        title={list.name}
        description={
          <>
            {list.modelIds.length} {list.modelIds.length === 1 ? "model" : "models"} · only you can see this
            <Link
              to={ROUTES.COLLECTIONS}
              className="group mt-3 flex w-fit items-center gap-1.5 text-sm font-semibold text-accent"
            >
              <ArrowLeft
                className="size-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden="true"
              />
              All collections
            </Link>
          </>
        }
        aside={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Pencil className="size-4" aria-hidden="true" />}
              onClick={() => {
                setName(list.name);
                setEditing(true);
                setConfirmDelete(false);
              }}
            >
              Rename
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="size-4" aria-hidden="true" />}
              onClick={() => {
                setConfirmDelete(true);
                setEditing(false);
              }}
            >
              Delete
            </Button>
          </div>
        }
      >
        {editing && (
          <form onSubmit={submitRename} className="mt-5 flex max-w-md gap-2">
            <label htmlFor="rename-collection" className="sr-only">
              Collection name
            </label>
            <input
              id="rename-collection"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
              onKeyDown={(event) => event.key === "Escape" && setEditing(false)}
              maxLength={COLLECTION_NAME_MAX}
              className="h-10 min-w-0 flex-1 rounded-lg border border-br-primary bg-surface-card px-3 text-sm text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-focus"
            />
            <Button type="submit" size="sm" className="h-10" disabled={!name.trim()}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-10" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </form>
        )}
        {confirmDelete && (
          <div
            role="alert"
            className="mt-5 flex max-w-xl flex-col gap-3 rounded-lg border border-error/40 bg-error/10 p-4 sm:flex-row sm:items-center"
          >
            <p className="flex-1 text-sm text-txt-primary">
              Delete &ldquo;{list.name}&rdquo;? The models stay on the site; only this list goes.
            </p>
            <div className="flex gap-2">
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={remove.isPending}>
                Delete collection
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                Keep it
              </Button>
            </div>
          </div>
        )}
        {(rename.isError || remove.isError) && (
          <p className="mt-3 text-sm text-error">That didn&apos;t go through. Try again.</p>
        )}
      </PageHeader>

      <div className="px-1 pt-6">
        {loadingModels ? (
          <HomeModelsGridSkeleton count={7} />
        ) : models.isError ? (
          <p className="mx-3 rounded-lg border border-dashed border-br-secondary px-4 py-8 text-center text-sm text-txt-secondary">
            These models couldn&apos;t load. Refresh to try again.
          </p>
        ) : shown.length === 0 ? (
          <StatePanel
            icon={Layers}
            title="This collection is empty"
            headingLevel="h2"
            className="min-h-[40vh]"
            actions={
              <Link to={ROUTES.HOME} className={buttonClassName()}>
                Browse models
              </Link>
            }
          >
            Open a model, tap Save and tick &ldquo;{list.name}&rdquo;.
          </StatePanel>
        ) : (
          <ShelfModels
            models={shown}
            removeLabel="Remove from this collection"
            onRemove={(modelId) => setInCollection.mutate({ id: list.id, modelId, included: false })}
          />
        )}
      </div>
    </div>
  );
};
