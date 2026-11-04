import { Link } from "react-router-dom";
import { Bookmark, LogIn } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { HomeModelsGridSkeleton } from "@/features/home/components/HomeModelsGrid";
import { PageHeader } from "@/features/shared/components/PageHeader";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { ROUTES } from "@/constants/routeConstants";
import { useFavoriteIds, useModelsByIds, useToggleFavorite } from "../hooks/useShelf";
import { ShelfModels } from "../components/ShelfParts";

/** Every model the user saved, newest first. */
export const SavedPage = () => {
  const { currentUser, authReady } = useAuth();
  const { open } = useModal("auth");
  const uid = currentUser?.uid;
  const favorites = useFavoriteIds(uid);
  const models = useModelsByIds(favorites.data);
  const toggle = useToggleFavorite(uid);

  if (authReady && !currentUser) {
    return (
      <StatePanel
        icon={LogIn}
        title="Sign in to see your saved models"
        actions={<Button onClick={() => open({ mode: "signin" })}>Sign in</Button>}
      >
        Saved models are kept with your account.
      </StatePanel>
    );
  }

  // Drop a removed model at once instead of waiting for the refetch.
  const shown = (models.data ?? []).filter((m) => favorites.data?.includes(m.id));
  const loading = !authReady || favorites.isPending || (models.isPending && (favorites.data?.length ?? 0) > 0);

  return (
    <div className="min-h-screen bg-page pb-16">
      <PageHeader
        eyebrow="Collections"
        title="Saved"
        description="Models you saved with the Save button, newest first."
        aside={
          favorites.data && (
            <p className="font-mono text-sm text-txt-muted">
              <span className="text-2xl font-semibold text-txt-primary">{favorites.data.length}</span>{" "}
              {favorites.data.length === 1 ? "model" : "models"}
            </p>
          )
        }
      />
      <div className="px-1 pt-6">
        {loading ? (
          <HomeModelsGridSkeleton count={7} />
        ) : favorites.isError || models.isError ? (
          <p className="mx-3 rounded-lg border border-dashed border-br-secondary px-4 py-8 text-center text-sm text-txt-secondary">
            Your saved models couldn&apos;t load. Refresh to try again.
          </p>
        ) : shown.length === 0 ? (
          <StatePanel
            icon={Bookmark}
            title="Nothing saved yet"
            headingLevel="h2"
            className="min-h-[40vh]"
            actions={
              <Link to={ROUTES.HOME} className={buttonClassName()}>
                Browse models
              </Link>
            }
          >
            Tap Save on any model and it shows up here.
          </StatePanel>
        ) : (
          <ShelfModels models={shown} removeLabel="Remove from Saved" onRemove={(id) => toggle.mutate(id)} />
        )}
      </div>
    </div>
  );
};
