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
    const { consent, acceptAll, declineAll } = useCookies();
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    const getConsentStatus = () => {
        if (!consent.accepted) return "Not Set";
        const acceptedCount = [consent.essential, consent.analytics, consent.marketing]
            .filter(Boolean).length;
        return `${acceptedCount}/3 Accepted`;
    };

    const handleResetCookies = () => {
        declineAll();
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