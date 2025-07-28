import { useState } from "react";

interface PaymentProcessorProps {
    amount: number;
    currency: string;
    onSuccess: (transactionId: string) => void;
    onError: (error: string) => void;
}

export function PaymentProcessor({
    amount,
    currency,
    onSuccess,
    onError,
}: PaymentProcessorProps) {
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = async () => {
        setIsProcessing(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000));

            const transactionId = `txn_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}`;

            onSuccess(transactionId);
        } catch {
            onError("Payment processing failed");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-bg-secondary border border-br-secondary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-txt-primary mb-4">
                Complete Payment
            </h3>

            <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-bg-primary rounded-lg">
                    <span className="text-txt-secondary">Total Amount:</span>
                    <span className="font-semibold text-txt-primary text-lg">
                        {currency} {amount.toFixed(2)}
                    </span>
                </div>

                <div className="space-y-3">
                    <input
                        type="text"
                        placeholder="Card Number"
                        className="w-full p-3 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary placeholder-txt-secondary"
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <input
                            type="text"
                            placeholder="MM/YY"
                            className="p-3 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary placeholder-txt-secondary"
                        />
                        <input
                            type="text"
                            placeholder="CVC"
                            className="p-3 border border-br-secondary rounded-lg bg-bg-primary text-txt-primary placeholder-txt-secondary"
                        />
                    </div>
                </div>

                <button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isProcessing ? "Processing..." : "Pay Now"}
                </button>
            </div>
        </div>
    );
}
