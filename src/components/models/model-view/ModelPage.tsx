import { useState, useEffect, lazy, Suspense } from "react";
import { useParams } from "react-router-dom";
//hooks
import { useModels } from "@/hooks/useModels";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useViewTracker, useModelViewCount } from "@/services/viewService";

const ModelViewer = lazy(() =>
    import("./ModelViewer").then((module) => ({ default: module.ModelViewer }))
);

//components
import { ModelSidebar } from "./ModelSidebar";
import { CommentsProvider } from "@/providers/commentsProvider";
import { ModelComments } from "./ModelComments";
import { Spinner } from "@/components/shared/Spinner";
import type { Model } from "@/types/model";

export function ModelPage() {
    const { id } = useParams<{ id: string }>();
    const { models, loading, uploader, fetchUploader } = useModels();
    const { currentUser } = useAuth();
    const { open } = useModal("auth");
    const [selectedRenderIndex, setSelectedRenderIndex] = useState<number>(-1);

    // Use new lightweight view tracking system
    useViewTracker(id, currentUser);
    const { count: viewCount, loading: viewCountLoading } = useModelViewCount(id);

    useEffect(() => {
        const m = models.find((m: Model) => m.id === id);
        if (m?.uploaderId) fetchUploader(m.uploaderId);
    }, [id, models, fetchUploader]);

    const model: Model | undefined = models.find((m: Model) => m.id === id);

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
                <Suspense
                    fallback={
                        <div className="relative w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex items-center justify-center contain-layout content-visibility-auto">
                            <Spinner size={32} />
                        </div>
                    }
                >
                    <ModelViewer
                        model={model}
                        selectedRenderIndex={selectedRenderIndex}
                        setSelectedRenderIndex={setSelectedRenderIndex}
                    />
                </Suspense>

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
