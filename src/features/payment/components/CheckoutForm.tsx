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
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" options={paymentElementOptions} onChange={handleElementChange} />

      {message && (
        <p
          role="status"
          className={`mt-4 rounded-lg border px-4 py-3 text-sm text-txt-primary ${
            message.includes("succeeded") ? "border-success/40 bg-success/10" : "border-error/40 bg-error/10"
          }`}
        >
          {message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-[auto_1fr] gap-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="ember"
          fullWidth
          isLoading={isLoading}
          disabled={!stripe || !elements || !isDetailsComplete}
        >
          Pay {paymentService.formatPrice(amount)}
        </Button>
      </div>

      <p className="mt-3 text-center text-xs text-txt-muted">
        {modelName} · Payments are processed by Stripe.
      </p>
    </form>
  );
};
