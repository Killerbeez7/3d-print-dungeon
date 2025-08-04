export interface ModelPaymentInfo {
    id: string;
    name: string;
    price: number;
    uploaderId: string;
    uploaderUsername?: string;
    uploaderDisplayName?: string;
    renderPrimaryUrl?: string;
    isPaid?: boolean;
    originalFileUrl?: string;
}

export interface CheckoutFormProps {
    modelId: string;
    amount: number;
    modelName: string;
    onSuccess?: (paymentIntent: unknown) => void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
}

export interface PaymentModalProps {
    model: ModelPaymentInfo;
    isOpen: boolean;
    onClose: () => void;
}

export interface PurchaseButtonProps {
    model: ModelPaymentInfo;
    className?: string;
}

export interface SellerVerificationProps {
    isOpen: boolean;
    onClose: () => void;
    returnUrl?: string;
}

export interface Purchase {
    id: string;
    modelId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    currency: string;
    status: string;
    purchasedAt: string; // or Date if you convert
    model: ModelPaymentInfo | null;
    // Add any other backend fields as needed
}

export interface SellerSale extends Purchase {
    buyer: { displayName: string; photoURL: string } | null;
} 