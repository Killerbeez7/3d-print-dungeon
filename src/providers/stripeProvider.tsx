import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import type { ReactNode } from "react";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
console.log("Stripe Key:", stripeKey ? "✅ Found" : "❌ Missing");

const stripePromise = loadStripe(stripeKey);

const stripeOptions = {
    appearance: {
        theme: "stripe" as const,
        variables: {
            colorPrimary: "#0570de",
            colorBackground: "#ffffff",
            colorText: "#30313d",
            colorDanger: "#df1b41",
            fontFamily: "Inter, system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
        },
    },
};

export interface StripeProviderProps {
    children: ReactNode;
}

export function StripeProvider({ children }: StripeProviderProps) {
    return (
        <Elements stripe={stripePromise} options={stripeOptions}>
            {children}
        </Elements>
    );
}
