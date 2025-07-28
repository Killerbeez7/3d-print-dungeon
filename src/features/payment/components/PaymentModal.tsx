import { useState, useEffect } from "react";
import { useModal } from "@/hooks/useModal";
import { CheckoutForm } from "./CheckoutForm";
import { LazyStripeProvider } from "../providers/LazyStripeProvider";
import type { PaymentModalProps } from "@/features/payment/types/payment";
import { paymentService } from "@/features/payment/services/paymentService";

export interface PaymentModalWithSuccessProps extends PaymentModalProps {
    onSuccess?: () => void;
}

export const PaymentModal = ({
    model,
    isOpen,
    onClose,
    onSuccess,
}: PaymentModalWithSuccessProps): React.ReactElement | null => {
    const [paymentStatus, setPaymentStatus] = useState<
        "idle" | "processing" | "success" | "error"
    >("idle");

    const [clientSecret, setClientSecret] = useState<string>("");

    // Create payment intent when the modal is opened
    useEffect(() => {
        const initPayment = async () => {
            if (!isOpen) return;
            try {
                setPaymentStatus("processing");
                const { clientSecret: secret } =
                    (await paymentService.createPaymentIntent(model.id, model.price)) as {
                        clientSecret: string;
                    };
                setClientSecret(secret);
                setPaymentStatus("idle");
            } catch (error) {
                console.error("Error initializing payment:", error);
                setPaymentStatus("error");
            }
        };

        initPayment();
    }, [isOpen, model.id, model.price]);

    const { close } = useModal("payment");

    const handlePaymentSuccess = () => {
        setPaymentStatus("success");
        setTimeout(() => {
            onClose();
            close();
            if (onSuccess) onSuccess();
            window.location.reload();
        }, 2000);
    };

    const handlePaymentError = (error: unknown) => {
        setPaymentStatus("error");
        console.error("Payment error:", error);
    };

    const handleCancel = () => {
        setPaymentStatus("idle");
        onClose();
        close();
    };

    if (!isOpen || !model) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-primary rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    {paymentStatus === "success" ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-green-600"
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
                            </div>
                            <h3 className="text-xl font-semibold text-txt-primary mb-2">
                                Payment Successful!
                            </h3>
                            <p className="text-txt-secondary mb-4">
                                You now have access to <strong>{model.name}</strong>
                            </p>
                            <p className="text-sm text-txt-muted">
                                Redirecting you back to the model...
                            </p>
                        </div>
                    ) : paymentStatus === "error" ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-red-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-txt-primary mb-2">
                                Payment Failed
                            </h3>
                            <p className="text-txt-secondary mb-4">
                                There was an issue processing your payment. Please try
                                again.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setPaymentStatus("idle")}
                                    className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-hover transition-colors"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="px-4 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-hover transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-txt-primary">
                                    Purchase Model
                                </h2>
                                <button
                                    onClick={handleCancel}
                                    className="text-txt-secondary hover:text-txt-primary transition-colors"
                                >
                                    <svg
                                        className="w-6 h-6"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            <div className="mb-6 p-4 bg-bg-surface rounded-lg">
                                <div className="flex items-center gap-4">
                                    {model.renderPrimaryUrl && (
                                        <img
                                            src={model.renderPrimaryUrl}
                                            alt={model.name}
                                            className="w-16 h-16 object-cover rounded-md"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-txt-primary">
                                            {model.name}
                                        </h3>
                                        <p className="text-sm text-txt-secondary">
                                            by {model.uploaderDisplayName}
                                        </p>
                                        <p className="text-lg font-bold text-accent mt-1">
                                            ${model.price}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <LazyStripeProvider clientSecret={clientSecret}>
                                <CheckoutForm
                                    modelId={model.id}
                                    amount={model.price}
                                    modelName={model.name}
                                    onSuccess={handlePaymentSuccess}
                                    onError={handlePaymentError}
                                    onCancel={handleCancel}
                                />
                            </LazyStripeProvider>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
