import { useRef, useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createAdvancedModel } from "@/features/models/services/modelsService";
import { finalConvertFileToGLB } from "@/features/models/utils/converter";
import { useModelViewer } from "@/hooks/useModelViewer";

// components
import { FilesUpload } from "../components/model-upload/FilesUpload";
import { InfoForm } from "../components/model-upload/InfoForm";
import { PricingForm } from "../components/model-upload/PricingForm";
import { AlertModal } from "@/features/shared/AlertModal";
import { SellerVerification } from "@/features/payment/components/SellerVerification";

import type { ModelData } from "@/features/models/types/model";

const UPLOAD_STATE_KEY = "pendingUploadState";

export function ModelUpload() {
    const { currentUser, userData } = useAuth();

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [files, setFiles] = useState<File[]>([]);
    const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null);
    const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showSellerVerification, setShowSellerVerification] = useState(false);
    const modelViewerLoaded = useModelViewer("timeout");

    const [modelData, setModelData] = useState<ModelData>({
        id: "",
        name: "",
        description: "",
        categoryIds: [],
        tags: [],
        renderFiles: [],
        renderPreviewUrls: [],
        selectedRenderIndex: 0,
        price: 0,
        isPaid: false,
        uploaderId: "",
        convertedFileUrl: "",
        originalFileUrl: "",
        renderExtraUrls: [],
        posterUrl: "",
        renderPrimaryUrl: "",
        uploaderDisplayName: "",
        isAI: false,
    });
    // @ts-expect-error FIX later
    const modelViewerRef = useRef();

    useEffect(() => {
        const savedStateJSON = sessionStorage.getItem(UPLOAD_STATE_KEY);
        if (savedStateJSON) {
            console.log("Found pending upload state, restoring form data...");
            const savedModelData = JSON.parse(savedStateJSON);
            setModelData((prevData) => ({
                ...prevData,
                name: savedModelData.name || "",
                description: savedModelData.description || "",
                categoryIds: savedModelData.categoryIds || [],
                tags: savedModelData.tags ?? [],
                price: savedModelData.price || 0,
                isPaid: savedModelData.isPaid || false,
            }));
            sessionStorage.removeItem(UPLOAD_STATE_KEY);
            setError(
                "Welcome back! To complete your upload, please re-select your 3D model file and any render images."
            );
        }
    }, []);

    useEffect(() => {
        if (!files || files.length === 0) return;

        let cleanupFn: (() => void) | undefined;
        async function loadIntoModelViewer() {
            if (!modelViewerLoaded) {
                console.log("Model viewer script not loaded yet, waiting...");
                return;
            }
            let blobToLoad: File | Blob = files[0];
            const lower = files[0].name.toLowerCase();

            if (lower.endsWith(".stl") || lower.endsWith(".obj")) {
                try {
                    const { blob } = await finalConvertFileToGLB(files[0]);
                    blobToLoad = blob;
                    setConvertedBlob(blob);
                } catch (err) {
                    console.error("Conversion to .glb failed:", err);
                    return () => {
                        // No cleanup needed
                    };
                }
            } else {
                setConvertedBlob(null);
            }

            const objUrl = URL.createObjectURL(blobToLoad);
            const mv = modelViewerRef.current;
            if (mv) {
                // @ts-expect-error FIX later
                mv.src = objUrl;
            }

            // Use the "load" event rather than "model-visibility"
            const handleModelLoad = async () => {
                console.log("Model loaded");
                // If available, wait for updateComplete to ensure rendering is done.
                // @ts-expect-error FIX later
                if (mv && mv.updateComplete) {
                    // @ts-expect-error FIX later
                    await mv.updateComplete;
                }
                // Pause to lock the frame
                if (mv) {
                    // @ts-expect-error FIX later
                    mv.pause();
                }
                // Wait a bit for the render to stabilize
                setTimeout(() => {
                    // @ts-expect-error FIX later
                    const dataUrl = mv ? mv.toDataURL("image/webp") : null;
                    console.log("Captured poster data URL", dataUrl);
                    setPosterDataUrl(dataUrl);
                }, 300);
            };

            if (mv) {
                // @ts-expect-error FIX later
                mv.addEventListener("load", handleModelLoad);
            }

            return () => {
                if (mv) {
                    // @ts-expect-error FIX later
                    mv.removeEventListener("load", handleModelLoad);
                }
                URL.revokeObjectURL(objUrl);
            };
        }

        loadIntoModelViewer().then((fn) => {
            cleanupFn = fn;
        });

        return () => {
            if (cleanupFn) cleanupFn();
        };
    }, [files, modelViewerLoaded]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
        if (!modelData.categoryIds?.length) {
            setError("Please choose at least one category.");
            return;
        }
        if (!modelData.description?.trim()) {
            setError("Please enter a model description.");
            return;
        }
        if (modelData.renderFiles?.length === 0) {
            setError("Please upload at least one render of your model.");
            return;
        }

        // Validate pricing if it's a paid model
        if (modelData.isPaid && (!modelData.price || modelData.price < 0.5)) {
            setError("Paid models must have a price of at least $0.50.");
            return;
        }

        // Check if user needs seller verification for paid models
        if (modelData.isPaid && modelData.price && modelData.price > 0) {
            // Check if user has completed seller verification.
            // If they don't have a connect ID in their profile, prompt to create one.
            if (!userData?.stripeConnectId) {
                console.log(
                    "Seller verification required. Saving upload state to sessionStorage."
                );
                sessionStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(modelData));
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
                categoryIds: modelData.categoryIds,
                tags: modelData.tags ?? [],
                file: firstFile,
                renderFiles: modelData.renderFiles ?? [],
                selectedRenderIndex: modelData.selectedRenderIndex ?? 0,
                uploaderId: currentUser?.uid ?? "",
                uploaderUsername: userData?.username ?? "",
                uploaderDisplayName: currentUser?.displayName ?? "",
                onProgress: setUploadProgress,
                posterBlob: posterBlob ?? undefined,
                preConvertedFile: convertedBlob ?? undefined,
                price: modelData.price,
                isPaid: modelData.isPaid,
                isAI: modelData.isAI,
            });

            setShowSuccessModal(true);
        } catch (err) {
            console.error("Upload error:", err);
            setError((err as Error).message || "Upload failed. Please try again.");
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
    const canProceedToStep3 =
        modelData.name.trim() &&
        modelData.categoryIds?.length &&
        modelData.description?.trim() &&
        modelData.renderFiles?.length &&
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
                    <form onSubmit={handleSubmit}>
                        <PricingForm modelData={modelData} setModelData={setModelData} />
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={prevStep}
                                className="px-6 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-hover transition-colors"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
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
                    </form>
                )}
            </div>

            {/* HIDDEN model-viewer for capturing the screenshot */}
            {/* @ts-expect-error FIX later */}
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
                message={`Your model has been successfully uploaded${
                    modelData.isPaid
                        ? " and is now available for purchase"
                        : " and is now available for download"
                }!`}
            />

            <SellerVerification
                isOpen={showSellerVerification}
                onClose={handleSellerVerificationClose}
                returnUrl={window.location.href}
            />
        </div>
    );
}

interface StepIndicatorProps {
    stepNumber: number;
    label: string;
    currentStep: number;
}

function StepIndicator({ stepNumber, label, currentStep }: StepIndicatorProps) {
    const isActive = currentStep === stepNumber;
    const isCompleted = currentStep > stepNumber;

    return (
        <div
            className={`flex items-center space-x-3 ${
                isActive
                    ? "text-accent"
                    : isCompleted
                    ? "text-green-600"
                    : "text-txt-secondary"
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
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                ) : (
                    stepNumber
                )}
            </div>
            <span className="font-semibold">{label}</span>
        </div>
    );
}
