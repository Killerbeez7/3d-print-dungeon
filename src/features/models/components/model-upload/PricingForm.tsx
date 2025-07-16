import { useState, ChangeEvent, FC } from "react";
import { paymentService } from "@/services/paymentService";
import { useAuth } from "@/hooks/useAuth";
import type { ModelData } from "@/features/models/types/model";

export interface PricingFormProps {
    modelData: ModelData;
    setModelData: React.Dispatch<React.SetStateAction<ModelData>>;
}

export const PricingForm: FC<PricingFormProps> = ({ modelData, setModelData }) => {
    const { userData } = useAuth();
    const [priceError, setPriceError] = useState<string>("");

    const isVerifiedSeller = Boolean(
        userData &&
            typeof userData === "object" &&
            "stripeConnectId" in userData &&
            (userData as { stripeConnectId?: string }).stripeConnectId
    );

    const handlePriceChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const value = e.target.value;
        setPriceError("");

        try {
            if (value === "" || value === "0") {
                setModelData((prev) => ({
                    ...prev,
                    price: 0,
                    isPaid: false,
                }));
                return;
            }

            const validatedPrice = paymentService.validatePrice(value);
            setModelData((prev) => ({
                ...prev,
                price: validatedPrice,
                isPaid: validatedPrice > 0,
            }));
        } catch (error) {
            setPriceError(error instanceof Error ? error.message : "Invalid price");
        }
    };

    const handleFreeToggle = (): void => {
        setModelData((prev) => ({
            ...prev,
            price: 0,
            isPaid: false,
        }));
        setPriceError("");
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-semibold text-txt-primary mb-4">
                    Pricing Options
                </h3>
                <p className="text-sm text-txt-secondary mb-6">
                    Choose whether to offer your model for free or set a price. You can
                    always change this later.
                </p>
            </div>

            <div className="space-y-4">
                {/* Free Option */}
                <div className="flex items-center space-x-3">
                    <input
                        type="radio"
                        id="free"
                        name="pricing"
                        checked={!modelData.isPaid}
                        onChange={handleFreeToggle}
                        className="w-4 h-4 text-accent bg-bg-surface border-br-secondary focus:ring-accent focus:ring-2"
                    />
                    <label htmlFor="free" className="flex-1">
                        <div className="font-medium text-txt-primary">Free Download</div>
                        <div className="text-sm text-txt-secondary">
                            Make your model available for free to all users
                        </div>
                    </label>
                </div>

                {/* Paid Option */}
                <div className="flex items-start space-x-3">
                    <input
                        type="radio"
                        id="paid"
                        name="pricing"
                        checked={Boolean(modelData.isPaid)}
                        onChange={() =>
                            setModelData((prev) => ({ ...prev, isPaid: true }))
                        }
                        className="w-4 h-4 mt-1 text-accent bg-bg-surface border-br-secondary focus:ring-accent focus:ring-2"
                    />
                    <label htmlFor="paid" className="flex-1">
                        <div className="font-medium text-txt-primary mb-2">
                            Set a Price
                        </div>
                        <div className="text-sm text-txt-secondary mb-3">
                            Earn money from your 3D models. We take a small platform fee.
                        </div>
                        {Boolean(modelData.isPaid) && (
                            <div className="space-y-3">
                                <div>
                                    <label
                                        htmlFor="price"
                                        className="block text-sm font-medium text-txt-primary mb-1"
                                    >
                                        Price (USD)
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-txt-secondary">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="price"
                                            min="0.50"
                                            max="999999"
                                            step="0.01"
                                            value={
                                                typeof modelData.price === "number" &&
                                                modelData.price !== 0
                                                    ? modelData.price
                                                    : ""
                                            }
                                            onChange={handlePriceChange}
                                            placeholder="0.00"
                                            className="block w-full pl-7 pr-3 py-2 border border-br-secondary rounded-md bg-bg-surface text-txt-primary placeholder-txt-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                        />
                                    </div>
                                    {priceError && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {priceError}
                                        </p>
                                    )}
                                </div>

                                <div className="bg-bg-surface p-3 rounded-md border border-br-secondary">
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-txt-secondary">
                                                Your price:
                                            </span>
                                            <span className="text-txt-primary">
                                                {paymentService.formatPrice(
                                                    typeof modelData.price === "number"
                                                        ? modelData.price
                                                        : 0
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-txt-secondary">
                                                Platform fee (5%):
                                            </span>
                                            <span className="text-txt-primary">
                                                -
                                                {paymentService.formatPrice(
                                                    (typeof modelData.price === "number"
                                                        ? modelData.price
                                                        : 0) * 0.05
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-medium border-t border-br-secondary pt-1">
                                            <span className="text-txt-primary">
                                                You earn:
                                            </span>
                                            <span className="text-accent">
                                                {paymentService.formatPrice(
                                                    (typeof modelData.price === "number"
                                                        ? modelData.price
                                                        : 0) * 0.95
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-txt-muted">
                                    <p>• Minimum price is $0.50</p>
                                    <p>
                                        • Payments are processed securely through Stripe
                                    </p>
                                    <p>
                                        • You&quot;ll need to set up a seller account to
                                        receive payments
                                    </p>
                                </div>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {Boolean(modelData.isPaid) && !isVerifiedSeller && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg
                                className="h-5 w-5 text-yellow-400"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                                <strong>Action Required:</strong> To sell models, you must
                                complete a one-time seller verification. You will be
                                redirected to Stripe to complete this securely after
                                clicking the final &quot;Upload Model&quot; button.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
