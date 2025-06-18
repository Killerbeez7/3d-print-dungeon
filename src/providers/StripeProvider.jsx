import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PropTypes from "prop-types";

// Initialize Stripe with your publishable key
console.log("Stripe Key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? "✅ Found" : "❌ Missing");
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const stripeOptions = {
    appearance: {
        theme: "stripe",
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

export const StripeProvider = ({ children }) => {
    return (
        <Elements stripe={stripePromise} options={stripeOptions}>
            {children}
        </Elements>
    );
};

StripeProvider.propTypes = {
    children: PropTypes.node.isRequired,
}; 