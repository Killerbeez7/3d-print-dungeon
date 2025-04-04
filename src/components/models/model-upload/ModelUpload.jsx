import React, { useState } from "react";
import { useAuth } from "../../../contexts/authContext";
import { createAdvancedModel } from "../../../services/modelsService";
// components
import { FilesUpload } from "./sections/FilesUpload";
import { InfoForm } from "./sections/InfoForm";

export function ModelUpload() {
    const [step, setStep] = useState(1);

    // Array for 3d model files
    const [files, setFiles] = useState([]);
    // Object for all other model data
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

    const [error, setError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const { currentUser } = useAuth();

    // Final submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setUploadProgress(0);

        // Validation checks
        if (files.length === 0) {
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
            const firstFile = files[0];
            const lower = firstFile.name.toLowerCase();
            ////////////////////////////////////////////////////////////////// check if needed
            // const convertedUrl =
            //     lower.endsWith(".gltf") || lower.endsWith(".glb")
            //         ? URL.createObjectURL(firstFile)
            //         : null;
            ////////////////////////////////////////////////////////////////////

            // call createAdvancedModel to update the DB
            await createAdvancedModel({
                name: modelData.name,
                description: modelData.description,
                category: modelData.category,
                tags: modelData.tags,
                file: firstFile,
                renderFiles: modelData.renderFiles,
                selectedRenderIndex: modelData.selectedRenderIndex,
                uploaderId: currentUser?.uid || "anonymous",
                onProgress: setUploadProgress,
            });

            alert("Model published successfully!");

            /////////////////////////////////////////////////////////////
            // TODO: add another logic when the upload is done
            /////////////////////////////////////////////////////////////
            // Reset everything on successfull upload
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

            {/* Display errors */}
            {error && (
                <div className="text-red-600 font-semibold text-center">{error}</div>
            )}

            {/* STEP 1 */}
            <FilesUpload step={step} files={files} setFiles={setFiles} />

            {/* STEP 2 */}
            {step === 2 && <InfoForm modelData={modelData} setModelData={setModelData} />}

            {/* upload progress bar */}
            {isUploading && (
                <div className="w-full bg-gray-200 rounded-md overflow-hidden">
                    <div
                        className="bg-green-500 h-4 transition-all"
                        style={{ width: `${uploadProgress}%` }}
                    ></div>
                </div>
            )}

            {/* Navigation Buttons */}
            <section className="bg-bg-secondary rounded-md p-4">
                {step === 1 && (
                    <div className="flex justify-center">
                        <button
                            onClick={() => setStep(2)}
                            className={`px-4 py-2 rounded-md ${
                                files.length === 0
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
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Submit"}
                        </button>
                    </div>
                )}
            </section>
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
