import { useState, FormEvent } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentService } from "@/features/payment/services/paymentService";
// Types
import type { CheckoutFormProps } from "@/features/payment/types/payment";
import type { StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import type { Stripe, StripeElements } from "@stripe/stripe-js";

export const CheckoutForm = ({
    amount,
    modelName,
    onSuccess,
    onError,
    onCancel,
}: CheckoutFormProps) => {
    const stripe = useStripe() as Stripe | null;
    const elements = useElements() as StripeElements | null;

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string | null>(null);
    const [isDetailsComplete, setIsDetailsComplete] = useState<boolean>(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setMessage(null);

        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/payment/success`,
            },
            redirect: "if_required",
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message ?? "");
            } else {
                setMessage("An unexpected error occurred.");
            }
            onError?.(error);
        } else if (paymentIntent && paymentIntent.status === "succeeded") {
            try {
                await paymentService.handlePaymentSuccess(paymentIntent.id);
                setMessage("Payment succeeded!");
                onSuccess?.(paymentIntent);
            } catch (backendError) {
                console.error("Backend error:", backendError);
                setMessage(
                    "Payment succeeded but there was an issue processing your purchase. Please contact support."
                );
                onError?.(backendError);
            }
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs" as const,
    };

    const handleElementChange = (event: StripePaymentElementChangeEvent) => {
        setIsDetailsComplete(event.complete);
    };

    return (
        <div className="max-w-md mx-auto bg-bg-surface rounded-lg p-6 shadow-lg">
            <div className="mb-6">
                <h3 className="text-xl font-semibold text-txt-primary mb-2">
                    Complete Your Purchase
                </h3>
                <div className="text-sm text-txt-secondary">
                    <p className="font-medium">{modelName}</p>
                    <p className="text-lg font-bold text-accent mt-1">
                        {paymentService.formatPrice(amount)}
                    </p>
                </div>
            </div>

            <form id="payment-form" onSubmit={handleSubmit}>
                <PaymentElement
                    id="payment-element"
                    options={paymentElementOptions}
                    onChange={handleElementChange}
                />

                <div className="flex gap-3 mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-br-secondary rounded-md text-txt-secondary hover:bg-bg-hover transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        disabled={isLoading || !stripe || !elements || !isDetailsComplete}
                        id="submit"
                        className="contrast-button flex-1 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <span id="button-text">
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Processing...
                                </div>
                            ) : (
                                `Pay ${paymentService.formatPrice(amount)}`
                            )}
                        </span>
                    </button>
                </div>

                {message && (
                    <div
                        className={`mt-4 p-3 rounded-md text-sm ${
                            message.includes("succeeded")
                                ? "bg-green-50 text-green-800 border border-green-200"
                                : "bg-red-50 text-red-800 border border-red-200"
                        }`}
                    >
                        {message}
                    </div>
                )}
            </form>
        </div>
    );
};
