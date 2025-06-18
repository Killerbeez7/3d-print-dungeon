import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createAdvancedModel } from "@/services/modelsService";
import { finalConvertFileToGLB } from "@/utils/models/converter";
import PropTypes from "prop-types";

// components
import { FilesUpload } from "./sections/FilesUpload";
import { InfoForm } from "./sections/InfoForm";
import { PricingForm } from "./sections/PricingForm";
import AlertModal from "@/components/shared/alert-modal/AlertModal";
import { SellerVerification } from "@/components/payment/SellerVerification";

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
    const [showSellerVerification, setShowSellerVerification] = useState(false);

    const [modelData, setModelData] = useState({
        name: "",
        description: "",
        category: "",
        tags: [],
        convertedUrl: null,
        renderFiles: [],
        renderPreviewUrls: [],
        selectedRenderIndex: 0,
        price: 0,
        isPaid: false,
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

        // Validate pricing if it's a paid model
        if (modelData.isPaid && (!modelData.price || modelData.price < 0.5)) {
            setError("Paid models must have a price of at least $0.50.");
            return;
        }

        // Check if user needs seller verification for paid models
        if (modelData.isPaid && modelData.price > 0) {
            // Check if user has completed seller verification
            // This would typically check user.stripeAccountId or user.sellerEnabled
            if (!currentUser?.stripeAccountId && !currentUser?.sellerEnabled) {
                setShowSellerVerification(true);
                return;
            }
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
                price: modelData.price,
                isPaid: modelData.isPaid,
            });

            setShowSuccessModal(true);
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const canProceedToStep2 = files.length > 0;
    const canProceedToStep3 = modelData.name.trim() && 
                              modelData.category.trim() && 
                              modelData.description.trim() && 
                              modelData.renderFiles.length > 0;

    const handleSellerVerificationClose = () => {
        setShowSellerVerification(false);
    };



    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-txt-primary mb-4">
                    Upload Your 3D Model
                </h1>
                <div className="flex items-center space-x-8 mb-8">
                    <StepIndicator stepNumber={1} label="Files" currentStep={step} />
                    <StepIndicator stepNumber={2} label="Details" currentStep={step} />
                    <StepIndicator stepNumber={3} label="Pricing" currentStep={step} />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <div className="bg-bg-surface rounded-lg p-6 shadow-sm">
                {step === 1 && (
                    <div>
                        <FilesUpload step={step} files={files} setFiles={setFiles} />
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={nextStep}
                                disabled={!canProceedToStep2}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next: Add Details
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <InfoForm modelData={modelData} setModelData={setModelData} />
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={prevStep}
                                className="px-6 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-hover transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!canProceedToStep3}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next: Set Pricing
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <PricingForm modelData={modelData} setModelData={setModelData} />
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={prevStep}
                                className="px-6 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-hover transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isUploading}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isUploading ? (
                                    <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Uploading... {Math.round(uploadProgress)}%
                                    </div>
                                ) : (
                                    "Upload Model"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

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
                message={`Your model has been successfully uploaded${modelData.isPaid ? ' and is now available for purchase' : ' and is now available for download'}!`}
            />

            <SellerVerification
                isOpen={showSellerVerification}
                onClose={handleSellerVerificationClose}
            />
        </div>
    );
}

function StepIndicator({ stepNumber, label, currentStep }) {
    const isActive = currentStep === stepNumber;
    const isCompleted = currentStep > stepNumber;
    
    return (
        <div
            className={`flex items-center space-x-3 ${
                isActive ? "text-accent" : isCompleted ? "text-green-600" : "text-txt-secondary"
            }`}
        >
            <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                    isActive 
                        ? "bg-accent shadow-lg shadow-accent/20" 
                        : isCompleted 
                        ? "bg-green-600" 
                        : "bg-bg-surface"
                } text-white font-bold`}
            >
                {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    stepNumber
                )}
            </div>
            <span className="font-semibold">{label}</span>
        </div>
    );
}

StepIndicator.propTypes = {
    stepNumber: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
    currentStep: PropTypes.number.isRequired,
};