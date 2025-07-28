import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCookieBite, faCog, faUndo } from "@fortawesome/free-solid-svg-icons";
import { CookieSettingsModal } from "@/features/policies/components/CookieSettingsModal";
import { useCookieManagement } from "../scripts/manageCookies";

export function CookieManagement() {
    const {
        consent,
        acceptAll,
        showSettingsModal,
        setShowSettingsModal,
        getConsentStatus,
        handleResetCookies,
    } = useCookieManagement();

    return (
        <>
            <div className="mb-8 p-4 bg-bg-secondary rounded-lg border border-br-secondary">
                <div className="flex items-center mb-4">
                    <FontAwesomeIcon icon={faCookieBite} className="mr-2 text-primary" />
                    <h3 className="text-lg font-semibold text-txt-primary">Cookie Management</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                        <span className="text-sm text-txt-secondary">Status:</span>
                        <span className="text-sm font-semibold text-txt-primary">{getConsentStatus()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                        <span className="text-sm text-txt-secondary">Essential:</span>
                        <span className={consent.essential ? "text-green-500" : "text-red-500"}>
                            {consent.essential ? "✓" : "✗"}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                        <span className="text-sm text-txt-secondary">Analytics:</span>
                        <span className={consent.analytics ? "text-green-500" : "text-red-500"}>
                            {consent.analytics ? "✓" : "✗"}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-bg-primary rounded-lg">
                        <span className="text-sm text-txt-secondary">Marketing:</span>
                        <span className={consent.marketing ? "text-green-500" : "text-red-500"}>
                            {consent.marketing ? "✓" : "✗"}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                        <FontAwesomeIcon icon={faCog} className="mr-2" />
                        Manage Preferences
                    </button>
                    
                    <button
                        onClick={() => acceptAll()}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faCookieBite} className="mr-2" />
                        Accept All
                    </button>
                    
                    <button
                        onClick={handleResetCookies}
                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <FontAwesomeIcon icon={faUndo} className="mr-2" />
                        Reset Cookies
                    </button>
                </div>
            </div>

            <CookieSettingsModal 
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </>
    );
} 