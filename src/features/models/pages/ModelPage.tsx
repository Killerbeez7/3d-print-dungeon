import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
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
import { Spinner } from "@/features/shared/reusable/Spinner";

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
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size={24} />
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex min-h-screen items-center justify-center">Model not found</div>
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

  return (
    <div>
      <div className="flex flex-col gap-4 p-4 text-txt-primary lg:flex-row lg:p-6 lg:pl-7 lg:pr-2">
        {/* Viewer */}
        <div className="flex flex-1 flex-col gap-4">
          <Suspense
            fallback={
              <div className="flex min-h-[320px] items-center justify-center">
                <Spinner size={24} />
              </div>
            }
          >
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
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-8 lg:px-7">
        <ModelComments modelId={model.id} openAuthModal={() => open({ mode: "login" })} />
      </div>
    </div>
  );
}
