import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import PropTypes from "prop-types";
import { ModelViewer } from "./ModelViewer";
import { ModelSidebar } from "./ModelSidebar";
import { useViewTracker } from "@/services/viewService";
import { useModels } from "@/hooks/useModels";
import { useAuth } from "@/hooks/useAuth";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/config/firebase";

export const ModelPage = () => {
    const { openAuthModal } = useOutletContext();
    const [viewCount, setViewCount] = useState(0);
    const [selectedRenderIndex, setSelectedRenderIndex] = useState(-1);

    const { id } = useParams();
    const { models, loading, uploader, fetchUploader } = useModels();
    const { currentUser } = useAuth();

    // Use the hook directly - it will handle the view tracking internally
    useViewTracker(id);

    // Listen to view count changes in real-time
    useEffect(() => {
        if (!id) return;

        const modelRef = doc(db, "models", id);
        const unsubscribe = onSnapshot(modelRef, (doc) => {
            if (doc.exists()) {
                setViewCount(doc.data().views || 0);
            }
        });

        return () => unsubscribe();
    }, [id]);

    useEffect(() => {
        const model = models.find((m) => m.id === id);
        if (model && model.uploaderId) {
            fetchUploader(model.uploaderId);
        }
    }, [id, models, fetchUploader]);

    const model = models.find((m) => m.id === id);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
                Loading model...
            </div>
        );
    }

    if (!model) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-txt-primary">
                Model not found!
            </div>
        );
    }

    return (
        <div className="bg-bg-primary text-txt-primary min-h-screen flex flex-col lg:flex-row gap-4 p-4 lg:p-6">
            {/* Left Side - Model Viewer */}
            <ModelViewer
                model={model}
                selectedRenderIndex={selectedRenderIndex}
                setSelectedRenderIndex={setSelectedRenderIndex}
            />

            {/* Right Side - Info Panel */}
            <ModelSidebar
                model={model}
                uploader={uploader}
                viewCount={viewCount}
                currentUser={currentUser}
                openAuthModal={openAuthModal}
            />
        </div>
    );
};

ModelPage.propTypes = {
    openAuthModal: PropTypes.func.isRequired,
};
