import { ModelUploadProvider, useModelUpload } from "../../../contexts/modelUploadContext";
import { FileUploadStep } from "./FileUploadStep";
import { ModelInfoStep } from "./ModelInfoStep";
import { useAuth } from "../../../contexts/authContext";
import { useState } from "react";

export const ModelUpload = () => {
    return (
        <ModelUploadProvider>
            <ModelUploadContent />
        </ModelUploadProvider>
    );
};

const ModelUploadContent = () => {
    const { step, setStep, files, modelData, setModelData, createModelInContext } = useModelUpload();
    const [error, setError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const { currentUser } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        if (files.length === 0) {
            console.log("The issue is in the files array");
            setError("Please select a model file first.");
            return;
        }
        if (!modelData.name.trim()) {
            setError("Please enter a model name.");
            return;
        }

        setIsUploading(true);

        try {
            const firstFile = files[0];
            const lower = firstFile.name.toLowerCase();
            const convertedUrl = lower.endsWith(".gltf") || lower.endsWith(".glb")
                ? URL.createObjectURL(firstFile)
                : null;

            // Pass firstFile directly instead of relying on modelData.file
            await createModelInContext({
                name: modelData.name,
                description: modelData.description,
                category: modelData.category,
                tags: modelData.tags,
                file: firstFile, // Ensure file is passed correctly
                renderFiles: modelData.renderFiles,
                convertedUrl,
                selectedRenderIndex: modelData.selectedRenderIndex,
                uploaderId: currentUser?.uid || "anonymous",
                onProgress: setUploadProgress,
            });

            alert("Model published successfully!");

            // Reset state after successful upload
            setModelData({
                name: "",
                description: "",
                category: "",
                tags: [],
                file: null,
                convertedUrl: null,
                renderFiles: [],
                renderPreviewUrls: [],
                selectedRenderIndex: 0,
            });

            setTimeout(() => setUploadProgress(0), 500); // Delay reset slightly to prevent flickering
        } catch (err) {
            console.error("Publish error:", err);
            setError("Upload failed. Check console for details.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-2">
            {/* Upload Progress Bar */}
            {isUploading && (
                <div className="w-full bg-gray-200 rounded-md overflow-hidden">
                    <div
                        className="bg-green-500 h-4 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            {/* Step Indicator */}
            <div className="flex items-center w-full max-w-md mx-auto mb-6">
                <StepIndicatorItem step={1} label="Upload" currentStep={step} />
                <div className="flex-1 mx-4 border-t border-dashed border-gray-300"></div>
                <StepIndicatorItem step={2} label="Model Information" currentStep={step} />
            </div>

            {/* Step Content */}
            <FileUploadStep />

            {/* Render ModelInfoStep only in step 2 */}
            {step === 2 && <ModelInfoStep />}

            {/* Navigation Buttons */}
            <section className="bg-bg-secondary rounded-md p-4">
                {step === 1 && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setStep(2)}
                            className={`px-4 py-2 rounded-md ${files.length === 0
                                ? "bg-btn-disabled"
                                : "bg-green-500 text-white px-4 py-2 hover:bg-green-600"
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
                            disabled={isUploading} // Prevent multiple clicks
                        >
                            {isUploading ? "Uploading..." : "Submit"}
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};

const StepIndicatorItem = ({ step, label, currentStep }) => {
    const isActive = currentStep === step;
    return (
        <div className={`flex items-center space-x-2 ${isActive ? 'text-green-600' : 'text-gray-600'}`}>
            <div className={`w-6 h-6 flex items-center justify-center rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-300'} text-white font-bold`}>
                {step}
            </div>
            <span className="font-semibold">{label}</span>
        </div>
    );
};
