import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
//hooks
import { useModels } from "../hooks/useModels";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import {
    useViewTracker,
    useModelViewCount,
} from "@/features/models/services/viewService";
import { useModelViewer } from "@/hooks/useModelViewer";
import { fullscreenConfig } from "@/config/fullscreenConfig";

const ModelViewer = lazy(() =>
    import("../components/model-view/ModelViewer").then((module) => ({
        default: module.ModelViewer,
    }))
);

//components
import { ModelSidebar } from "../components/model-view/ModelSidebar";
import { ModelThumbnails } from "../components/model-view/ModelThumbnails";
import { CommentsProvider } from "@/features/models/providers/commentsProvider";
import { ModelComments } from "../components/model-view/ModelComments";
import { Spinner } from "@/features/shared/reusable/Spinner";
import type { ModelData } from "@/features/models/types/model";

export function ModelPage() {
    const { modelId } = useParams<{ modelId: string }>();
    const { models, loading, uploader, fetchUploader } = useModels();
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const [selectedRenderIndex, setSelectedRenderIndex] = useState<number>(-1);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const modelViewerLoaded = useModelViewer("timeout");

    // Use new lightweight view tracking system
    useViewTracker(modelId ?? "", currentUser ?? undefined);
    const { count: viewCount, loading: viewCountLoading } = useModelViewCount(
        modelId ?? ""
    );

    useEffect(() => {
        const m = models.find((m: ModelData) => m.id === modelId);
        if (m?.uploaderId) fetchUploader(m.uploaderId);
    }, [modelId, models, fetchUploader]);

    // Track fullscreen state changes
    useEffect(() => {
        const cleanup = fullscreenConfig.onChange(() => {
            setIsFullscreen(fullscreenConfig.isFullscreen());
        });
        return cleanup;
    }, []);

    const model: ModelData | undefined = models.find((m: ModelData) => m.id === modelId);

    // Prepare combined render URLs for both viewer and thumbnails
    const combinedRenderUrls = model
        ? [
              ...(model.renderPrimaryUrl ? [model.renderPrimaryUrl] : []),
              ...(Array.isArray(model.renderExtraUrls) ? model.renderExtraUrls : []),
          ]
        : [];

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size={24} />
            </div>
        );
    if (!model)
        return (
            <div className="min-h-screen flex items-center justify-center">
                Model not found
            </div>
        );

    return (
        <div>
            <div className="text-txt-primary flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
                {/* VIEWER  --------------------------------------------------- */}
                <div className="flex-1 flex flex-col gap-4">
                    {modelViewerLoaded ? (
                        <Suspense
                            fallback={
                                <div className="relative w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center contain-layout content-visibility-auto">
                                    <Spinner size={32} />
                                </div>
                            }
                        >
                            {(() => {
                                const viewerModel = {
                                    ...model,
                                    // Pass the merged array so the viewer can work unchanged
                                    renderExtraUrls: combinedRenderUrls,
                                } as typeof model;

                                return (
                                    <ModelViewer
                                        model={viewerModel}
                                        selectedRenderIndex={selectedRenderIndex}
                                        setSelectedRenderIndex={setSelectedRenderIndex}
                                    />
                                );
                            })()}
                        </Suspense>
                    ) : (
                        <div className="relative w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center contain-layout content-visibility-auto">
                            <Spinner size={32} />
                        </div>
                    )}

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
                    uploader={uploader}
                    viewCount={viewCount}
                    viewCountLoading={viewCountLoading}
                    currentUser={currentUser}
                    openAuthModal={() => open({ mode: "login" })}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <h2 className="text-2xl text-txt-primary mb-4">Comments</h2>
                <CommentsProvider modelId={model.id}>
                    <ModelComments openAuthModal={() => open({ mode: "login" })} />
                </CommentsProvider>
            </div>
        </div>
    );
}
