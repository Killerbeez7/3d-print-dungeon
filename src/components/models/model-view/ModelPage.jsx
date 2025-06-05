import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";
//hooks
import { useModels } from "@/hooks/useModels";
import { useAuth } from "@/hooks/useAuth";
import { useModal } from "@/hooks/useModal";
import { useViewTracker } from "@/services/viewService";
//components
import { ModelViewer } from "./ModelViewer";
import { ModelSidebar } from "./ModelSidebar";
import { CommentsProvider } from "@/providers/commentsProvider";
import { ModelComments } from "./ModelComments";
import { Spinner } from "@/components/shared/Spinner";

export const ModelPage = () => {
    const { id } = useParams();
    const { models, loading, uploader, fetchUploader } = useModels();
    const { currentUser } = useAuth();
    const { open } = useModal("auth");

    const [viewCount, setViewCount] = useState(0);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState(-1);

    useViewTracker(id);

    useEffect(() => {
        if (!id) return;
        const unsub = onSnapshot(doc(db, "models", id), (snap) =>
            setViewCount(snap.exists() ? snap.data().views ?? 0 : 0)
        );
        return unsub;
    }, [id]);

    useEffect(() => {
        const m = models.find((m) => m.id === id);
        if (m?.uploaderId) fetchUploader(m.uploaderId);
    }, [id, models, fetchUploader]);

    const model = models.find((m) => m.id === id);

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
                <ModelViewer
                    model={model}
                    selectedRenderIndex={selectedRenderIndex}
                    setSelectedRenderIndex={setSelectedRenderIndex}
                />

                <ModelSidebar
                    model={model}
                    uploader={uploader}
                    viewCount={viewCount}
                    currentUser={currentUser}
                    openAuthModal={(p) => open({ mode: p?.mode ?? "login" })}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <CommentsProvider modelId={model.id}>
                    <ModelComments
                        openAuthModal={(p) => open({ mode: p?.mode ?? "login" })}
                    />
                </CommentsProvider>
            </div>
        </div>
    );
};
