import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Cookie,
    Settings,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { CookieSettingsModal } from "@/features/policies/components/CookieSettingsModal";
import { useCookieManagement } from "../scripts/manageCookies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookieBite, faUndo } from "@fortawesome/free-solid-svg-icons";

export const CookieManagement = () => {
    const [isOpen, setIsOpen] = useState(false);
    const {
        consent,
        acceptAll,
        showSettingsModal,
        setShowSettingsModal,
        getConsentStatus,
        handleResetCookies,
    } = useCookieManagement();

    return (
        <div className="mb-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-3 bg-bg-secondary rounded-lg border border-br-secondary hover:bg-bg-primary transition-colors"
            >
                <div className="flex items-center">
                    <Cookie className="w-5 h-5 mr-2 text-primary" />
                    <span className="font-semibold text-txt-primary">
                        Cookie Management
                    </span>
                    <span className="ml-2 px-2 py-1 text-xs bg-primary text-white rounded-full">
                        {getConsentStatus()}
                    </span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {isOpen && (
                <div className="mt-2 p-4 bg-bg-secondary rounded-lg border border-br-secondary">
                    {/* Status Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center justify-between p-2 bg-bg-primary rounded-lg">
                            <span className="text-xs text-txt-secondary">Essential</span>
                            {consent.essential ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                        </div>

                        <div className="flex items-center justify-between p-2 bg-bg-primary rounded-lg">
                            <span className="text-xs text-txt-secondary">Analytics</span>
                            {consent.analytics ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                        </div>

                        <div className="flex items-center justify-between p-2 bg-bg-primary rounded-lg">
                            <span className="text-xs text-txt-secondary">Marketing</span>
                            {consent.marketing ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="flex items-center justify-center px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm"
                        >
                            <Settings className="w-4 h-4 mr-1" />
                            Preferences
                        </button>

                        <button
                            onClick={() => acceptAll()}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                            <FontAwesomeIcon icon={faCookieBite} className="mr-2" />
                            Accept All
                        </button>

                        <button
                            onClick={handleResetCookies}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                            <FontAwesomeIcon icon={faUndo} className="mr-2" />
                            Reset
                        </button>
                    </div>
                </div>
            )}

            <CookieSettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </div>
    );
};
