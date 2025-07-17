import { Suspense, lazy, ReactNode } from "react";
import { Spinner } from "@/features/shared/reusable/Spinner";
import type { StripeElementsOptions } from "@stripe/stripe-js";

export interface LazyStripeProviderProps {
    children: ReactNode;
    clientSecret: string;
}

const Elements = lazy(() =>
    import("@stripe/react-stripe-js").then((mod) => ({ default: mod.Elements }))
);

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
    console.error(
        "[LazyStripeProvider] Missing Stripe publishable key. Please set VITE_STRIPE_PUBLISHABLE_KEY in your environment variables."
    );
}

const stripePromise = publishableKey
    ? import("@stripe/stripe-js").then(({ loadStripe }) => loadStripe(publishableKey))
    : Promise.resolve(null);

const baseStripeOptions: StripeElementsOptions = {
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

export function LazyStripeProvider({ children, clientSecret }: LazyStripeProviderProps) {
    if (!clientSecret) {
        return (
            <div className="flex items-center justify-center p-8">
                <Spinner size={24} />
            </div>
        );
    }

    return (
        <Suspense fallback={<Spinner size={24} />}>
            <Elements
                stripe={stripePromise}
                options={{ ...baseStripeOptions, clientSecret } as StripeElementsOptions}
                key={clientSecret}
            >
                {children}
            </Elements>
        </Suspense>
    );
}
