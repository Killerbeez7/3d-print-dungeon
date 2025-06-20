import { functions } from "@/config/firebase";
import { httpsCallable } from "firebase/functions";

const TestStripeButton = () => {
    const testStripe = async () => {
        try {
            const callTest = httpsCallable(functions, "testStripeConnection");
            const result = await callTest();
            console.log("✅ Stripe connection test successful:", result.data);
            alert(
                "Stripe connection successful! Balance: " +
                    JSON.stringify(result.data.balance)
            );
        } catch (error) {
            console.error("❌ Stripe test failed:", error);
            alert("Stripe test failed: " + error.message);
        }
    };

    return <button className="bg-blue-500 text-white p-2 rounded-md m-5" onClick={testStripe}>Test Stripe Connection</button>;
};

export default TestStripeButton;
