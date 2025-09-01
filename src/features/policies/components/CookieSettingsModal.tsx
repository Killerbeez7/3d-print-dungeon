import { useState, useEffect } from "react";
import { useCookies } from "../hooks/useCookies";
import "@/styles/customScrollbar.css";

interface CookieCategory {
    title: string;
    description: string;
    required: boolean;
    details: string[];
    examples: string[];
    impact: string;
}

const cookieCategories: Record<string, CookieCategory> = {
    essential: {
        title: "Essential Cookies",
        description:
            "These cookies are strictly necessary for the website to function and cannot be disabled.",
        required: true,
        details: [
            "Authentication and security",
            "Session management",
            "Basic website functionality",
            "Shopping cart functionality",
            "User preferences storage",
        ],
        examples: [
            "Session cookies for login status",
            "CSRF protection tokens",
            "Language preference settings",
        ],
        impact: "Disabling these cookies will prevent the website from functioning properly.",
    },
    analytics: {
        title: "Analytics Cookies",
        description:
            "Help us understand how visitors interact with our website to improve user experience.",
        required: false,
        details: [
            "Page view tracking",
            "User behavior analysis",
            "Performance monitoring",
            "Error tracking",
            "Traffic source analysis",
        ],
        examples: ["Google Analytics", "Heatmap tracking", "Conversion tracking"],
        impact: "Disabling these cookies will prevent us from improving the website based on usage data.",
    },
    marketing: {
        title: "Marketing Cookies",
        description:
            "Used to deliver personalized advertisements and content based on your interests.",
        required: false,
        details: [
            "Ad personalization",
            "Social media integration",
            "Retargeting campaigns",
            "Cross-site tracking",
            "Interest-based advertising",
        ],
        examples: ["Facebook Pixel", "Google Ads", "Social media sharing buttons"],
        impact: "Disabling these cookies will show you generic ads instead of personalized content.",
    },
    payment: {
        title: "Payment Cookies",
        description: "Required for secure payment processing and transaction management.",
        required: false,
        details: [
            "Payment security",
            "Transaction verification",
            "Fraud prevention",
            "Payment method storage",
            "Order processing",
        ],
        examples: [
            "Stripe payment tokens",
            "PayPal session cookies",
            "3D Secure authentication",
        ],
        impact: "Disabling these cookies will prevent secure payment processing.",
    },
};

interface CookieSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
    const {
        consent,
        updateMultipleCategories,
        acceptAll: contextAcceptAll,
        declineAll: contextDeclineAll,
    } = useCookies();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [localConsent, setLocalConsent] = useState(consent);

    useEffect(() => {
        if (isOpen) {
            // Open with all options enabled by default for better UX
            setLocalConsent({
                essential: true,
                analytics: true,
                marketing: true,
                payment: true,
                accepted: true,
            });
        }
    }, [isOpen]);

    const toggleSection = (category: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(category)) {
            newExpanded.delete(category);
        } else {
            newExpanded.add(category);
        }
        setExpandedSections(newExpanded);
    };

    const handleToggle = (categoryId: string, value: boolean) => {
        setLocalConsent((prev) => ({
            ...prev,
            [categoryId]: value,
        }));
    };

    const handleAcceptAll = () => {
        contextAcceptAll();

        setLocalConsent({
            essential: true,
            analytics: true,
            marketing: true,
            payment: true,
            accepted: true,
        });

        onClose();
    };

    const handleDeclineNonEssentials = () => {
        contextDeclineAll();

        setLocalConsent({
            essential: true,
            analytics: false,
            marketing: false,
            payment: false,
            accepted: true, // Set to true so banner doesn't show again
        });

        onClose();
    };

    const handleSaveSettings = () => {
        // Update all categories at once and save to cookies
        updateMultipleCategories({
            analytics: localConsent.analytics,
            marketing: localConsent.marketing,
            payment: localConsent.payment,
            accepted: true,
        });

        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
            <div className="bg-bg-secondary rounded-xl shadow-2xl max-w-xl w-full h-[60vh] flex flex-col border border-br-primary">
                {/* Header */}
                <div className="p-4 border-b border-br-secondary flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-txt-primary">
                            Cookie Settings
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-txt-secondary hover:text-txt-primary transition-colors text-lg"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-txt-secondary mt-2 text-xs">
                        Customize your cookie preferences. Essential cookies are always
                        enabled for site functionality.
                    </p>
                </div>

                {/* Cookie Categories */}
                <div className="p-4 flex-1 overflow-y-auto bg-bg-primary custom-scrollbar">
                    <div className="space-y-3">
                        {Object.entries(cookieCategories).map(([category, info]) => (
                            <div
                                key={category}
                                className="border border-br-primary rounded-lg overflow-hidden"
                            >
                                <div className="bg-bg-secondary p-3">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => toggleSection(category)}
                                            className="text-txt-secondary hover:text-txt-primary transition-colors text-base font-bold"
                                        >
                                            {expandedSections.has(category) ? "−" : "+"}
                                        </button>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium text-txt-primary">
                                                    {info.title}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        localConsent[
                                                            category as keyof typeof localConsent
                                                        ] as boolean
                                                    }
                                                    disabled={category === "essential"}
                                                    onChange={(e) =>
                                                        handleToggle(
                                                            category,
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="w-4 h-4 text-primary border-br-secondary rounded focus:ring-primary disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {expandedSections.has(category) && (
                                    <div className="border-t border-br-secondary bg-bg-secondary p-3 space-y-3">
                                        <div>
                                            <h4 className="text-xs font-medium text-txt-primary mb-1">
                                                What these cookies do:
                                            </h4>
                                            <ul className="text-xs text-txt-secondary space-y-1">
                                                {info.details.map((detail, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <span className="text-primary">
                                                            •
                                                        </span>
                                                        <span>{detail}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-medium text-txt-primary mb-1">
                                                Examples:
                                            </h4>
                                            <div className="text-xs text-txt-secondary space-y-1">
                                                {info.examples.map((example, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-start gap-2"
                                                    >
                                                        <span className="text-primary">
                                                            •
                                                        </span>
                                                        <span>{example}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-bg-surface p-2 rounded">
                                            <h4 className="text-xs font-medium text-txt-primary mb-1">
                                                Impact of disabling:
                                            </h4>
                                            <p className="text-xs text-txt-secondary">
                                                {info.impact}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-br-secondary flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div className="text-xs text-txt-secondary">
                            <p>Last updated: {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleDeclineNonEssentials}
                                className="px-3 py-1.5 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                            >
                                Decline Non-Essentials
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveSettings}
                                className="px-3 py-1.5 text-xs border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded"
                            >
                                Save Settings
                            </button>
                            <button
                                type="button"
                                onClick={handleAcceptAll}
                                className="px-3 py-1.5 text-xs border border-br-secondary text-txt-secondary hover:text-txt-primary hover:border-br-primary transition-colors rounded"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
