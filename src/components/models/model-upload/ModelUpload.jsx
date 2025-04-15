import { useRef, useState, useEffect } from "react";
import { useAuth } from "../../../contexts/authContext";
import { createAdvancedModel } from "../../../services/modelsService";
import { finalConvertFileToGLB } from "../../../utils/models/converter";
// components
import { FilesUpload } from "./sections/FilesUpload";
import { InfoForm } from "./sections/InfoForm";

export function ModelUpload() {
    const { currentUser } = useAuth();

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [files, setFiles] = useState([]);
    const [posterDataUrl, setPosterDataUrl] = useState(null);
    const [convertedBlob, setConvertedBlob] = useState(null);

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

            const result = await createAdvancedModel({
                name: modelData.name,
                description: modelData.description,
                category: modelData.category,
                tags: modelData.tags,
                file: firstFile,
                renderFiles: modelData.renderFiles,
                selectedRenderIndex: modelData.selectedRenderIndex,
                uploaderId: currentUser?.uid || "anonymous",
                onProgress: setUploadProgress,
                posterBlob,
                preConvertedFile: convertedBlob,
            });

            alert("Model + Poster uploaded!\nDoc ID: " + result.modelId);

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
        <div className="container mx-auto p-4 space-y-2">
            {/* Step Indicator */}
            <div className="flex items-center w-full max-w-md mx-auto mb-6">
                <StepIndicator stepNumber={1} label="Upload" currentStep={step} />
                <div className="flex-1 mx-4 border-t border-dashed border-gray-300"></div>
                <StepIndicator
                    stepNumber={2}
                    label="Model Information"
                    currentStep={step}
                />
            </div>

            {error && (
                <div className="text-red-600 font-semibold text-center">{error}</div>
            )}

            <FilesUpload step={step} files={files} setFiles={setFiles} />

            {step === 2 && <InfoForm modelData={modelData} setModelData={setModelData} />}

            {isUploading && (
                <div className="w-full bg-gray-200 rounded-md overflow-hidden">
                    <div
                        className="bg-green-500 h-4 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                    />
                </div>
            )}

            <section className="bg-bg-secondary rounded-md p-4">
                {step === 1 && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setStep(2)}
                            className={`px-4 py-2 rounded-md ${
                                files.length === 0
                                    ? "bg-btn-disabled"
                                    : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            disabled={files.length === 0}
                        >
                            Next Step
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => setStep(1)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                        >
                            Previous Step
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Submit"}
                        </button>
                    </div>
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
        </div>
    );
}

function StepIndicator({ stepNumber, label, currentStep }) {
    const isActive = currentStep === stepNumber;
    return (
        <div
            className={`flex items-center space-x-2 ${
                isActive ? "text-green-600" : "text-gray-600"
            }`}
        >
            <div
                className={`w-6 h-6 flex items-center justify-center rounded-full ${
                    isActive ? "bg-green-500" : "bg-gray-300"
                } text-white font-bold`}
            >
                {stepNumber}
            </div>
            <span className="font-semibold">{label}</span>
        </div>
    );
}
