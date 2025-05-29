import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createAdvancedModel } from "@/services/modelsService";
import { finalConvertFileToGLB } from "@/utils/models/converter";
// components
import { FilesUpload } from "./sections/FilesUpload";
import { InfoForm } from "./sections/InfoForm";
import AlertModal from "@/components/shared/alert-modal/AlertModal";

export function ModelUpload() {
    const { currentUser } = useAuth();

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [files, setFiles] = useState([]);
    const [posterDataUrl, setPosterDataUrl] = useState(null);
    const [convertedBlob, setConvertedBlob] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [modelData, setModelData] = useState({
        name: "",
        description: "",
        category: "",
        tags: [],
        convertedUrl: null,
        renderFiles: [],
        renderPreviewUrls: [],
        selectedRenderIndex: 0,
    });

    const modelViewerRef = useRef();

    useEffect(() => {
        if (!files || files.length === 0) return;
        const firstFile = files[0];
        const lower = firstFile.name.toLowerCase();

        async function loadIntoModelViewer() {
            let blobToLoad = firstFile;
            if (lower.endsWith(".stl") || lower.endsWith(".obj")) {
                try {
                    const { blob } = await finalConvertFileToGLB(firstFile);
                    blobToLoad = blob;
                    setConvertedBlob(blob);
                } catch (err) {
                    console.error("Conversion to .glb failed:", err);
                    return;
                }
            } else {
                setConvertedBlob(null);
            }

            const objUrl = URL.createObjectURL(blobToLoad);
            const mv = modelViewerRef.current;
            mv.src = objUrl;

            // Use the "load" event rather than "model-visibility"
            const handleModelLoad = async () => {
                console.log("Model loaded");
                // If available, wait for updateComplete to ensure rendering is done.
                if (mv.updateComplete) {
                    await mv.updateComplete;
                }
                // Pause to lock the frame
                mv.pause();
                // Wait a bit for the render to stabilize
                setTimeout(() => {
                    const dataUrl = mv.toDataURL("image/webp");
                    console.log("Captured poster data URL", dataUrl);
                    setPosterDataUrl(dataUrl);
                }, 300);
            };

            mv.addEventListener("load", handleModelLoad);

            return () => {
                mv.removeEventListener("load", handleModelLoad);
                URL.revokeObjectURL(objUrl);
            };
        }

        const cleanupFn = loadIntoModelViewer();
        return () => {
            if (typeof cleanupFn === "function") cleanupFn();
        };
    }, [files]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        if (!files || files.length === 0) {
            setError("Please select a model file first.");
            return;
        }
        if (!modelData.name.trim()) {
            setError("Please enter a model name.");
            return;
        }
        if (!modelData.category.trim()) {
            setError("Please enter a category.");
            return;
        }
        if (!modelData.description.trim()) {
            setError("Please enter a model description.");
            return;
        }
        if (modelData.renderFiles.length === 0) {
            setError("Please upload at least one render of your model.");
            return;
        }

        setIsUploading(true);

        try {
            let posterBlob = null;
            if (posterDataUrl) {
                const response = await fetch(posterDataUrl);
                posterBlob = await response.blob();
            } else {
                console.warn("Poster data URL is null.");
            }

            const firstFile = files[0];

            await createAdvancedModel({
                name: modelData.name,
                description: modelData.description,
                category: modelData.category,
                tags: modelData.tags,
                file: firstFile,
                renderFiles: modelData.renderFiles,
                selectedRenderIndex: modelData.selectedRenderIndex,
                uploaderId: currentUser?.uid,
                uploaderDisplayName: currentUser?.displayName,
                onProgress: setUploadProgress,
                posterBlob,
                preConvertedFile: convertedBlob,
            });

            setShowSuccessModal(true);

            setFiles([]);
            setModelData({
                name: "",
                description: "",
                category: "",
                tags: [],
                convertedUrl: null,
                renderFiles: [],
                renderPreviewUrls: [],
                selectedRenderIndex: 0,
            });
            setTimeout(() => setUploadProgress(0), 500);
        } catch (err) {
            console.error("Publish error:", err);
            setError("Upload failed. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-6xl">
            {/* Step Indicator */}
            <div className="flex items-center w-full max-w-md mx-auto mb-8">
                <StepIndicator stepNumber={1} label="Upload" currentStep={step} />
                <div className="flex-1 mx-4 border-t border-dashed border-br-surface"></div>
                <StepIndicator
                    stepNumber={2}
                    label="Model Information"
                    currentStep={step}
                />
            </div>

            {error && (
                <div className="bg-error/10 border border-error/20 rounded-lg p-4 text-error font-semibold text-center">
                    {error}
                </div>
            )}

            <div className="rounded-xl p-6">
                <FilesUpload step={step} files={files} setFiles={setFiles} />

                {step === 2 && (
                    <div className="mt-6 pt-6 border-t border-br-secondary">
                        <InfoForm modelData={modelData} setModelData={setModelData} />
                    </div>
                )}
            </div>

            {isUploading && (
                <div className="w-full bg-bg-surface rounded-lg overflow-hidden">
                    <div
                        className="bg-accent h-2 transition-all duration-300 ease-in-out"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}

            <section className="flex justify-center gap-4 mt-8">
                {step === 1 ? (
                    files.length > 0 && (
                        <button
                            onClick={() => setStep(2)}
                            className="cta-button px-6 py-3 font-semibold transition-all"
                        >
                            Next Step
                        </button>
                    )
                ) : (
                    <>
                        <button
                            onClick={() => setStep(1)}
                            className="secondary-button px-6 py-3"
                        >
                            Previous Step
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="cta-button px-6 py-3"
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Submit"}
                        </button>
                    </>
                )}
            </section>

            {/* HIDDEN model-viewer for capturing the screenshot */}
            <model-viewer
                ref={modelViewerRef}
                style={{
                    width: "100%",
                    height: "100%",
                    aspectRatio: "2.5 / 1",
                    maxWidth: "1000px",
                    opacity: 0,
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                    pointerEvents: "none",
                    zIndex: -1,
                    backgroundColor: "#616161",
                }}
                camera-controls
                environment-image="neutral"
            />

            <AlertModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                title="Upload Successful!"
                message="Your model has been successfully uploaded!"
            />
        </div>
    );
}

function StepIndicator({ stepNumber, label, currentStep }) {
    const isActive = currentStep === stepNumber;
    return (
        <div
            className={`flex items-center space-x-3 ${
                isActive ? "text-accent" : "text-txt-secondary"
            }`}
        >
            <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                    isActive ? "bg-accent shadow-lg shadow-accent/20" : "bg-bg-surface"
                } text-white font-bold`}
            >
                {stepNumber}
            </div>
            <span className="font-semibold">{label}</span>
        </div>
    );
}
