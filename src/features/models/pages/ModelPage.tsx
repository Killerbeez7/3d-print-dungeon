import { useState, useEffect, lazy, Suspense } from "react";
import { Link, useParams } from "react-router-dom";
import { Box } from "lucide-react";
//hooks
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { useFetchModel } from "../hooks";
import { usePublicProfile } from "@/features/user/profile";
import {
  useViewTracker,
  useModelViewCount,
} from "@/features/models/services/viewService";
import { useThreeJsImporter } from "@/features/models/hooks/useOnDemandModelViewer";
// Config
import { fullscreenConfig } from "@/config/fullscreenConfig";
//components
import { ModelSidebar } from "../components/model-view/ModelSidebar";
import { ModelThumbnails } from "../components/model-view/ModelThumbnails";

import { ModelComments } from "../components/model-view/ModelComments";
import { ModelPageSkeleton } from "../components/model-view/ModelPageSkeleton";
import { PurchaseButton } from "@/features/payment/components/PurchaseButton";
import { buttonClassName } from "@/components";
import { StatePanel } from "@/features/shared/components/StatePanel";
import { MODEL_CATEGORIES } from "@/features/models/constants/modelCategories";
import { formatPrice } from "@/features/models/utils/modelMeta";
import { useScreenSize } from "@/hooks/useScreenSize";

const ModelViewer = lazy(() =>
  import("../components/model-view/ModelViewer").then((module) => ({
    default: module.ModelViewer,
  }))
);

export function ModelPage() {
  const { modelId } = useParams<{ modelId: string }>();

  const { currentUser } = useAuth();
  const { open } = useModal("auth");

  const [selectedRenderIndex, setSelectedRenderIndex] = useState<number>(-1);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const { data: model, isLoading: modelLoading } = useFetchModel(modelId);

  const { data: uploader, isLoading: uploaderLoading } = usePublicProfile(
    model?.uploaderId
  );

  const { threeImported, importThreeJs } = useThreeJsImporter();
  const { isDesktop } = useScreenSize();

  // Load Three.js when the page opens
  useEffect(() => {
    importThreeJs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useViewTracker(modelId ?? "", currentUser ?? undefined);
  const { count: viewCount, loading: viewCountLoading } = useModelViewCount(
    modelId ?? ""
  );

  // Track fullscreen state changes
  useEffect(() => {
    const cleanup = fullscreenConfig.onChange(() => {
      setIsFullscreen(fullscreenConfig.isFullscreen());
    });
    return cleanup;
  }, []);

  if (modelLoading) {
    return <ModelPageSkeleton />;
  }

  if (!model) {
    return (
      <StatePanel
        icon={Box}
        title="Model not found"
        actions={
          <Link to="/" className={buttonClassName()}>
            Browse models
          </Link>
        }
      >
        It may have been removed, or the link is wrong.
      </StatePanel>
    );
  }

  const combinedRenderUrls = [
    ...(model.renderPrimaryUrl ? [model.renderPrimaryUrl] : []),
    ...(Array.isArray(model.renderExtraUrls) ? model.renderExtraUrls : []),
  ];

  const viewerModel = {
    ...model,
    renderExtraUrls: combinedRenderUrls,
  };

  const category = MODEL_CATEGORIES.find((item) => model.categoryIds?.includes(item.id));
  const isPaid = Boolean(model.isPaid && model.price && model.price > 0);
  const purchaseModel = {
    ...model,
    price: model.price ?? 0,
    uploaderId: model.uploaderId ?? "",
  };

  return (
    <div className="mx-auto max-w-[1600px] px-3 pb-28 pt-4 text-txt-primary sm:px-6 lg:px-8 lg:pb-12">
      <nav aria-label="Breadcrumb" className="label-mono mb-4 flex min-w-0 items-center gap-2 text-txt-muted">
        <Link to="/" className="transition-colors hover:text-txt-primary">
          Models
        </Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <Link
              to={`/?category=${category.id}`}
              className="transition-colors hover:text-txt-primary"
            >
              {category.name}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="truncate text-txt-secondary" aria-current="page">
          {model.name}
        </span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Viewer */}
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <Suspense fallback={<div className="skeleton-print h-[52vh] rounded-lg lg:h-[calc(100vh-15rem)]" />}>
            <ModelViewer
              model={viewerModel}
              selectedRenderIndex={selectedRenderIndex}
              setSelectedRenderIndex={setSelectedRenderIndex}
              threeImported={threeImported}
            />
          </Suspense>

          {/* Thumbnails - Visible when not in fullscreen */}
          {!isFullscreen && (
            <ModelThumbnails
              renderUrls={combinedRenderUrls}
              selectedRenderIndex={selectedRenderIndex}
              setSelectedRenderIndex={setSelectedRenderIndex}
            />
          )}
        </div>

        <ModelSidebar
          model={model}
          uploader={uploaderLoading ? undefined : uploader ?? undefined}
          viewCount={viewCount}
          viewCountLoading={viewCountLoading}
          currentUser={currentUser}
          openAuthModal={() => open({ mode: "login" })}
          showPurchase={isDesktop}
        />
      </div>

      <section className="mt-12 border-t border-br-subtle pt-8">
        <ModelComments modelId={model.id} openAuthModal={() => open({ mode: "login" })} />
      </section>

      {/* Phones: the main action stays in reach at the bottom of the screen. */}
      {!isDesktop && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-br-subtle bg-page/95 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 backdrop-blur-xl">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{model.name}</p>
            <p className={`font-mono text-sm ${isPaid ? "text-ember" : "text-txt-muted"}`}>
              {isPaid ? formatPrice(model.price as number, model.currency) : "Free"}
            </p>
          </div>
          <PurchaseButton model={purchaseModel} className="shrink-0" />
        </div>
      )}
    </div>
  );
}
