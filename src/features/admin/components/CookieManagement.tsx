import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Cookie,
  Settings,
  CheckCircle,
  Undo2,
  XCircle,
} from "lucide-react";
import { CookieSettingsModal } from "@/features/cookies/components/CookieSettingsModal";
import { useCookieManagement } from "../scripts/manageCookies";

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
        className="flex items-center justify-between w-full p-3 bg-section rounded-lg border border-br-secondary hover:bg-page transition-colors"
      >
        <div className="flex items-center">
          <Cookie className="w-5 h-5 mr-2 text-accent" />
          <span className="font-semibold text-txt-primary">Cookie Management</span>
          <span className="ml-2 px-2 py-1 text-xs bg-muted text-txt-primary rounded-full">
            {getConsentStatus()}
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 bg-section rounded-lg border border-br-secondary">
          {/* Status Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="flex items-center justify-between p-2 bg-page rounded-lg">
              <span className="text-xs text-txt-secondary">Essential</span>
              {consent.essential ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-error" />
              )}
            </div>

            <div className="flex items-center justify-between p-2 bg-page rounded-lg">
              <span className="text-xs text-txt-secondary">Analytics</span>
              {consent.analytics ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-error" />
              )}
            </div>

            <div className="flex items-center justify-between p-2 bg-page rounded-lg">
              <span className="text-xs text-txt-secondary">Marketing</span>
              {consent.marketing ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-error" />
              )}
            </div>

            <div className="flex items-center justify-between p-2 bg-page rounded-lg">
              <span className="text-xs text-txt-secondary">Payment</span>
              {consent.payment ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <XCircle className="w-4 h-4 text-error" />
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center justify-center px-3 py-2 bg-muted text-txt-primary rounded-lg hover:bg-surface-elevated transition-colors text-sm"
            >
              <Settings className="w-4 h-4 mr-1" />
              Preferences
            </button>

            <button
              onClick={() => acceptAll()}
              className="px-3 py-2 bg-success text-page rounded-lg hover:opacity-90 transition-colors text-sm"
            >
              <Cookie className="size-4 mr-2" aria-hidden="true" />
              Accept All
            </button>

            <button
              onClick={handleResetCookies}
              className="px-3 py-2 bg-error text-page rounded-lg hover:bg-error-hover transition-colors text-sm"
              title="Reset to default: only essential cookies enabled"
            >
              <Undo2 className="size-4 mr-2" aria-hidden="true" />
              Reset to Default
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
