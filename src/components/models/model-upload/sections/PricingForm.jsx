import { useState } from "react";
import { paymentService } from "@/services/paymentService";
import PropTypes from "prop-types";

export const PricingForm = ({ modelData, setModelData }) => {
    const [priceError, setPriceError] = useState("");

    const handlePriceChange = (e) => {
        const value = e.target.value;
        setPriceError("");

        try {
            if (value === "" || value === "0") {
                setModelData(prev => ({
                    ...prev,
                    price: 0,
                    isPaid: false,
                }));
                return;
            }

            const validatedPrice = paymentService.validatePrice(value);
            setModelData(prev => ({
                ...prev,
                price: validatedPrice,
                isPaid: validatedPrice > 0,
            }));
        } catch (error) {
            setPriceError(error.message);
        }
    };

    const handleFreeToggle = () => {
        setModelData(prev => ({
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
                    Choose whether to offer your model for free or set a price. You can always change this later.
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
                        checked={modelData.isPaid}
                        onChange={() => setModelData(prev => ({ ...prev, isPaid: true }))}
                        className="w-4 h-4 mt-1 text-accent bg-bg-surface border-br-secondary focus:ring-accent focus:ring-2"
                    />
                    <label htmlFor="paid" className="flex-1">
                        <div className="font-medium text-txt-primary mb-2">Set a Price</div>
                        <div className="text-sm text-txt-secondary mb-3">
                            Earn money from your 3D models. We take a small platform fee.
                        </div>
                        
                        {modelData.isPaid && (
                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-txt-primary mb-1">
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
                                            value={modelData.price || ""}
                                            onChange={handlePriceChange}
                                            placeholder="0.00"
                                            className="block w-full pl-7 pr-3 py-2 border border-br-secondary rounded-md bg-bg-surface text-txt-primary placeholder-txt-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                                        />
                                    </div>
                                    {priceError && (
                                        <p className="mt-1 text-sm text-red-600">{priceError}</p>
                                    )}
                                </div>

                                <div className="bg-bg-surface p-3 rounded-md border border-br-secondary">
                                    <div className="text-sm space-y-1">
                                        <div className="flex justify-between">
                                            <span className="text-txt-secondary">Your price:</span>
                                            <span className="text-txt-primary">
                                                {paymentService.formatPrice(modelData.price || 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-txt-secondary">Platform fee (5%):</span>
                                            <span className="text-txt-primary">
                                                -{paymentService.formatPrice((modelData.price || 0) * 0.05)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-medium border-t border-br-secondary pt-1">
                                            <span className="text-txt-primary">You earn:</span>
                                            <span className="text-accent">
                                                {paymentService.formatPrice((modelData.price || 0) * 0.95)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-txt-muted">
                                    <p>• Minimum price is $0.50</p>
                                    <p>• Payments are processed securely through Stripe</p>
                                    <p>• You&apos;ll need to set up a seller account to receive payments</p>
                                </div>
                            </div>
                        )}
                    </label>
                </div>
            </div>

            {modelData.isPaid && modelData.price > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800">
                                Seller Account Required
                            </h3>
                            <div className="mt-2 text-sm text-blue-700">
                                <p>
                                    To sell models, you&apos;ll need to complete seller verification after uploading. 
                                    This helps us ensure secure payments and comply with financial regulations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

PricingForm.propTypes = {
    modelData: PropTypes.shape({
        price: PropTypes.number,
        isPaid: PropTypes.bool,
    }).isRequired,
    setModelData: PropTypes.func.isRequired,
}; 