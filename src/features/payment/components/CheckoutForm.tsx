import { useState, FormEvent } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { paymentService } from "@/features/payment/services/paymentService";
// Types
import type { CheckoutFormProps } from "@/features/payment/types/payment";
import type { StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import type { Stripe, StripeElements } from "@stripe/stripe-js";
import { Button } from "@/components";

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
    <div className="max-w-md mx-auto bg-surface-card rounded-lg p-6 shadow-lg">
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

        <div className="mt-6 flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            fullWidth
            isLoading={isLoading}
            disabled={!stripe || !elements || !isDetailsComplete}
          >
            Pay {paymentService.formatPrice(amount)}
          </Button>
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
