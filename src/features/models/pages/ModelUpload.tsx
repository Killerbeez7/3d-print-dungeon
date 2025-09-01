import { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSystemAlert } from "@/features/system-alerts";
import { createAdvancedModel } from "@/features/models/services/modelsService";
import { finalConvertFileToGLB } from "@/features/models/utils/converter";
import { useModelViewer } from "@/features/models/hooks/useModelViewer";

// components
import { FilesUpload } from "../components/model-upload/FilesUpload";
import { InfoForm } from "../components/model-upload/InfoForm";
import { PricingForm } from "../components/model-upload/PricingForm";
import { SellerVerification } from "@/features/payment/components/SellerVerification";
import { paymentService } from "@/features/payment/services/paymentService";
import { H1 } from "@/components/index";

import type { ModelData } from "@/features/models/types/model";

const UPLOAD_STATE_KEY = "pendingUploadState";

export function ModelUpload() {
    const { currentUser, privateProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const notification = useSystemAlert();

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [files, setFiles] = useState<File[]>([]);
    const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null);
    const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
    const [showSellerVerification, setShowSellerVerification] = useState(false);
    const modelViewerLoaded = useModelViewer("timeout");
    const [isPollingConnectStatus, setIsPollingConnectStatus] = useState(false);

    // Gentle prompt banner: show if no connect id or cached status is not fully active
    const needsSellerVerification = Boolean(
        privateProfile &&
            (!privateProfile.stripeConnectId ||
                privateProfile.stripeConnectStatus?.isFullyActive === false)
    );

    // Check if user has a pending verification (account exists but not fully active)
    const hasPendingVerification = Boolean(
        privateProfile?.stripeConnectId &&
            !privateProfile.stripeConnectStatus?.isFullyActive
    );

    // Polling for Connect status updates when user is in verification process
    useEffect(() => {
        if (!isPollingConnectStatus || !currentUser) return;

        let attempts = 0;
        const maxAttempts = 30; // Reduced to 2.5 minutes max (30 * 5 seconds)
        const intervalId = setInterval(async () => {
            attempts++;
            console.log(
                `🔄 [Polling] Attempt ${attempts}/${maxAttempts} - Checking Connect status...`
            );

            try {
                const status = await paymentService.checkConnectStatus();
                console.log("🔄 [Polling] Status received:", status);

                if (status?.isFullyActive) {
                    setIsPollingConnectStatus(false);
                    clearInterval(intervalId);
                    console.log("✅ [Polling] Connect account is now fully active!");

                    // Show success notification
                    notification.success(
                        "Seller Verification Complete! 🎉",
                        "Your account is now ready to sell models. You can continue with your upload.",
                        5000
                    );
                } else if (status?.hasConnectAccount) {
                    console.log("🔄 [Polling] Account exists but not fully active yet:", {
                        chargesEnabled: status.isEnabledForCharges,
                        detailsSubmitted: status.detailsSubmitted,
                        requirementsDue: status.requirementsDue,
                    });
                }
            } catch (error) {
                console.warn("⚠️ [Polling] checkConnectStatus failed:", error);
                // Don't stop polling on transient errors, only on auth/permission errors
                const errorCode = (error as { code?: string })?.code;
                if (
                    errorCode === "unauthenticated" ||
                    errorCode === "permission-denied"
                ) {
                    setIsPollingConnectStatus(false);
                    clearInterval(intervalId);
                    console.log("❌ [Polling] Stopped due to auth error");
                }
            }

            if (attempts >= maxAttempts) {
                setIsPollingConnectStatus(false);
                clearInterval(intervalId);
                console.log("⏰ [Polling] Stopped after max attempts");

                // Show timeout notification
                notification.warning(
                    "Verification Timeout",
                    "The verification process is taking longer than expected. Please check your email or try again later.",
                    8000
                );
            }
        }, 5000); // Check every 5 seconds

        return () => {
            clearInterval(intervalId);
            console.log("🧹 [Polling] Cleanup - interval cleared");
        };
    }, [isPollingConnectStatus, currentUser, notification]);

    // Start polling when user goes to verification
    const handleStartVerification = () => {
        setShowSellerVerification(true);
        setIsPollingConnectStatus(true);
    };

    // Force refresh Connect status (for debugging webhook issues)
    // const forceRefreshStatus = async () => {
    //     try {
    //         console.log("🔄 [Force Refresh] Manually refreshing Connect status...");
    //         const status = await paymentService.checkConnectStatus();
    //         console.log("✅ [Force Refresh] Status received:", status);

    //         if (status.isFullyActive) {
    //             notification.success(
    //                 "Status Updated! 🎉",
    //                 "Your Connect account is now fully active!",
    //                 5000
    //             );
    //         } else {
    //             notification.info(
    //                 "Status Checked",
    //                 `Account status: ${status.hasConnectAccount ? 'Exists' : 'None'}, Active: ${status.isFullyActive}`,
    //                 3000
    //             );
    //         }
    //     } catch (error) {
    //         console.error("❌ [Force Refresh] Failed:", error);
    //         notification.error(
    //             "Status Check Failed",
    //             "Unable to check Connect status. Please try again.",
    //             3000
    //         );
    //     }
    // };

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

    // Function to reset all form fields
    const resetAllFields = () => {
        setStep(1);
        setError("");
        setIsUploading(false);
        setUploadProgress(0);
        setFiles([]);
        setPosterDataUrl(null);
        setConvertedBlob(null);
        setShowSellerVerification(false);

        setModelData({
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
    };

    // Function to handle successful upload
    const handleUploadSuccess = () => {
        // Show green success notification
        notification.success(
            "Upload Successful! 🎉",
            `Your model "${modelData.name}" has been successfully uploaded${
                modelData.isPaid
                    ? " and is now available for purchase"
                    : " and is now available for download"
            }!`,
            5000 // Show for 5 seconds
        );

        // Reset all fields
        resetAllFields();

        // Navigate to home page after a short delay
        setTimeout(() => {
            navigate("/");
        }, 1000);
    };

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

    // Re-evaluate Stripe Connect status on URL changes (returnUrl/refreshUrl outcomes)
    useEffect(() => {
        if (!currentUser) return;

        // Check if user is returning from Stripe Connect onboarding
        const urlParams = new URLSearchParams(location.search);
        const isReturnFromStripe =
            urlParams.get("stripe_connect") === "success" ||
            urlParams.get("account_id") ||
            location.pathname.includes("stripe");

        if (isReturnFromStripe) {
            console.log("🔄 [URL Change] Detected return from Stripe Connect onboarding");
            // Clear any URL parameters to avoid re-triggering
            window.history.replaceState({}, document.title, location.pathname);

            // Only check status if returning from Stripe (not on every route change)
            paymentService
                .checkConnectStatus()
                .then((status) => {
                    if (status.isFullyActive) {
                        console.log(
                            "✅ [URL Change] Connect account is now active after return"
                        );
                        notification.success(
                            "Welcome Back! 🎉",
                            "Your seller verification is complete. You can now upload paid models.",
                            5000
                        );
                    }
                })
                .catch((error) => {
                    console.warn(
                        "⚠️ [URL Change] Failed to check Connect status:",
                        error
                    );
                    // ignore transient errors
                });
        }
    }, [location.pathname, location.search, currentUser, notification]);

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
            console.log("🔍 [Upload] Checking seller verification for paid model...");

            // Fast path: no connect id at all
            if (!privateProfile?.stripeConnectId) {
                console.log(
                    "❌ [Upload] No Connect account found - verification required"
                );
                sessionStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(modelData));
                setShowSellerVerification(true);
                return;
            }

            // Check if user has pending verification (account exists but not fully active)
            if (hasPendingVerification) {
                console.log(
                    "❌ [Upload] User has pending verification - cannot upload paid models yet"
                );
                setError(
                    "Your seller verification is still pending. Please complete the verification process before uploading paid models. You can check your email for verification instructions or contact support if you need help."
                );
                return;
            }

            // Check cached status first (faster, no API call)
            if (privateProfile?.stripeConnectStatus?.isFullyActive) {
                console.log(
                    "✅ [Upload] Using cached status - Connect account is fully active"
                );
            } else {
                // Has an account id but cached status shows incomplete, verify with API
                try {
                    const status = await paymentService.checkConnectStatus();
                    console.log("🔍 [Upload] API status check:", status);

                    if (!status.isFullyActive) {
                        console.log(
                            "❌ [Upload] Connect account not fully active - verification required"
                        );

                        // Show helpful message about what's needed
                        if (status.requirementsDue.length > 0) {
                            setError(
                                `Seller verification incomplete: Complete requirements: ${status.requirementsDue.join(
                                    ", "
                                )}`
                            );
                        } else if (!status.isEnabledForCharges) {
                            setError(
                                "Seller verification incomplete: Complete account verification to enable charges"
                            );
                        } else if (!status.detailsSubmitted) {
                            setError(
                                "Seller verification incomplete: Submit required business details"
                            );
                        } else {
                            setError(
                                "Seller verification required to upload paid models."
                            );
                        }

                        sessionStorage.setItem(
                            UPLOAD_STATE_KEY,
                            JSON.stringify(modelData)
                        );
                        setShowSellerVerification(true);
                        return;
                    }

                    console.log(
                        "✅ [Upload] Connect account is fully active - proceeding with upload"
                    );
                } catch (statusErr) {
                    console.warn(
                        "⚠️ [Upload] checkConnectStatus failed; deferring to verification modal.",
                        statusErr
                    );
                    setError(
                        "Unable to verify seller status. Please complete seller verification."
                    );
                    sessionStorage.setItem(UPLOAD_STATE_KEY, JSON.stringify(modelData));
                    setShowSellerVerification(true);
                    return;
                }
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
                uploaderUsername:
                    currentUser?.displayName?.toLowerCase().replace(/\s+/g, "") ||
                    (currentUser?.uid ? `user${currentUser.uid.slice(0, 8)}` : ""),
                uploaderDisplayName: currentUser?.displayName ?? "",
                onProgress: setUploadProgress,
                posterBlob: posterBlob ?? undefined,
                preConvertedFile: convertedBlob ?? undefined,
                price: modelData.price,
                isPaid: modelData.isPaid,
                isAI: modelData.isAI,
            });

            handleUploadSuccess();
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
                <H1 size="3xl" className="mb-4">
                    Upload Your 3D Model
                </H1>
                <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 mb-8">
                    <StepIndicator stepNumber={1} label="Files" currentStep={step} />
                    <StepIndicator stepNumber={2} label="Details" currentStep={step} />
                    <StepIndicator stepNumber={3} label="Pricing" currentStep={step} />
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-md">
                    <p className="text-error">{error}</p>
                </div>
            )}

            {needsSellerVerification && (
                <div className="mb-6 p-4 bg-accent/5 border border-accent/20 rounded-lg backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                                <svg
                                    className="w-4 h-4 text-accent"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-txt-primary">
                                    {hasPendingVerification
                                        ? "Pending verification"
                                        : "Want to sell your models?"}
                                </p>
                                <p className="text-xs text-txt-secondary">
                                    {hasPendingVerification
                                        ? "Your account is being verified. Complete the process to enable paid model uploads."
                                        : "Complete seller verification to enable paid model uploads"}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            {!hasPendingVerification ? (
                                <button
                                    onClick={handleStartVerification}
                                    className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-accent text-white hover:bg-accent-hover"
                                >
                                    Verify Now
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={handleStartVerification}
                                        className="px-4 py-2 text-sm font-medium rounded-md transition-colors bg-accent text-white hover:bg-accent-hover"
                                    >
                                        Continue verification
                                    </button>
                                    {/* <button
                                        onClick={forceRefreshStatus}
                                        className="px-3 py-2 text-xs font-medium rounded-md bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                                        title="Force refresh status (webhook debugging)"
                                    >
                                        🔄 Refresh
                                    </button> */}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-bg-secondary rounded-lg p-4 sm:p-6 shadow-md">
                {step === 1 && (
                    <div>
                        <FilesUpload step={step} files={files} setFiles={setFiles} />
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={nextStep}
                                disabled={!canProceedToStep2}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 transition-colors font-medium"
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
                                className="px-6 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-tertiary transition-colors font-medium"
                            >
                                Back
                            </button>
                            <button
                                onClick={nextStep}
                                disabled={!canProceedToStep3}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
                                className="px-6 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-tertiary transition-colors font-medium"
                            >
                                Back
                            </button>
                            <button
                                type="submit"
                                disabled={isUploading}
                                className="px-6 py-2 bg-accent text-white rounded-md hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
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
                    ? "text-success"
                    : "text-txt-secondary"
            }`}
        >
            <div
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
                    isActive
                        ? "bg-accent shadow-lg shadow-accent/20"
                        : isCompleted
                        ? "bg-success"
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
