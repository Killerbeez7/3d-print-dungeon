import { useCookies } from "@/features/policies/hooks/useCookies";
import { useState } from "react";
import { CookieConsent } from "@/features/policies/types/cookies";

export interface CookieManagementState {
    consent: CookieConsent;
    acceptAll: () => void;
    declineAll: () => void;
    showSettingsModal: boolean;
    setShowSettingsModal: (show: boolean) => void;
    getConsentStatus: () => string;
    handleResetCookies: () => void;
}

export function useCookieManagement(): CookieManagementState {
    const { consent, acceptAll, declineAll, resetToDefault } = useCookies();
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const getConsentStatus = () => {
        if (!consent.accepted) return "Not Set";
        const acceptedCount = [consent.essential, consent.analytics, consent.marketing, consent.payment]
            .filter(Boolean).length;
        return `${acceptedCount}/4 Accepted`;
    };

    const handleResetCookies = () => {
        // Reset to default state (only essential cookies enabled)
        resetToDefault();
    };

    return {
        consent,
        acceptAll,
        declineAll,
        showSettingsModal,
        setShowSettingsModal,
        getConsentStatus,
        handleResetCookies,
    };
} 