import { useState, useEffect } from "react";

import "@/styles/customScrollbar.css";

import { useCookies } from "../hooks/useCookies";
import type { CookieCategory, OptionalCookieCategory } from "../types/cookies";

interface CookieCategoryInfo {
  title: string;
  description: string;
  required: boolean;
  details: string[];
  examples: string[];
  impact: string;
}

const cookieCategories: Record<CookieCategory, CookieCategoryInfo> = {
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
    impact:
      "Disabling these cookies would prevent parts of the website from functioning properly.",
  },
  analytics: {
    title: "Analytics Cookies",
    description:
      "Help us understand how visitors interact with the website so we can improve it.",
    required: false,
    details: [
      "Page view tracking",
      "User behavior analysis",
      "Performance monitoring",
      "Error tracking",
      "Traffic source analysis",
    ],
    examples: ["Analytics tools", "Performance tracking", "Conversion tracking"],
    impact:
      "Disabling these cookies limits the usage data available to help us improve the website.",
  },
  marketing: {
    title: "Marketing Cookies",
    description:
      "Used for personalized content, recommendations, and marketing features.",
    required: false,
    details: [
      "Personalized recommendations",
      "Ad personalization",
      "Retargeting campaigns",
      "Social media integration",
      "Interest-based content",
    ],
    examples: [
      "Personalized recommendations",
      "Advertising integrations",
      "Social media features",
    ],
    impact:
      "Disabling these cookies may prevent personalized recommendations and marketing features.",
  },
  payment: {
    title: "Payment Cookies",
    description:
      "Used by payment-related features when additional storage or third-party services are required.",
    required: false,
    details: [
      "Payment security",
      "Transaction verification",
      "Fraud prevention",
      "Payment processing",
    ],
    examples: [
      "Payment provider integrations",
      "Transaction verification",
      "3D Secure authentication",
    ],
    impact:
      "Disabling these cookies may prevent some payment-related features from working.",
  },
};

interface CookieSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CookieSettingsModal({ isOpen, onClose }: CookieSettingsModalProps) {
  const { consent, updateMultipleCategories, acceptAll, declineAll } = useCookies();

  const [expandedSections, setExpandedSections] = useState<Set<CookieCategory>>(
    new Set()
  );

  const [localConsent, setLocalConsent] = useState(consent);

  useEffect(() => {
    if (isOpen) {
      setLocalConsent(consent);
    }
  }, [isOpen, consent]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const toggleSection = (category: CookieCategory) => {
    setExpandedSections((current) => {
      const next = new Set(current);

      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }

      return next;
    });
  };

  const handleToggle = (category: OptionalCookieCategory, value: boolean) => {
    setLocalConsent((current) => ({
      ...current,
      [category]: value,
    }));
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  const handleDeclineNonEssentials = () => {
    declineAll();
    onClose();
  };

  const handleSaveSettings = () => {
    updateMultipleCategories({
      analytics: localConsent.analytics,
      marketing: localConsent.marketing,
      payment: localConsent.payment,
      accepted: true,
    });

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const categoryEntries = Object.entries(cookieCategories) as [
    CookieCategory,
    CookieCategoryInfo
  ][];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-settings-title"
        className="flex max-h-[82vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-br-secondary bg-section shadow-2xl"
      >
        {/* Header */}
        <div className="flex-shrink-0 border-b border-br-secondary px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="cookie-settings-title"
                className="text-lg font-semibold tracking-tight text-txt-primary"
              >
                Cookie Settings
              </h2>

              <p className="mt-1 max-w-md text-xs leading-relaxed text-txt-secondary">
                Choose which optional cookies you allow. Essential cookies are always
                enabled.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close cookie settings"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-br-secondary bg-surface-card text-sm text-txt-secondary transition-all hover:border-br-primary hover:text-txt-primary"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Cookie Categories */}
        <div className="custom-scrollbar-md flex-1 overflow-y-auto bg-page/60 p-3">
          <div className="space-y-2">
            {categoryEntries.map(([category, info]) => {
              const isExpanded = expandedSections.has(category);
              const isEssential = category === "essential";

              return (
                <div
                  key={category}
                  className="overflow-hidden rounded-xl border border-br-secondary bg-section transition-colors hover:border-br-primary"
                >
                  {/* Category Header */}
                  <div className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSection(category)}
                        aria-label={`${isExpanded ? "Collapse" : "Expand"} ${info.title}`}
                        aria-expanded={isExpanded}
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-br-secondary bg-surface-card text-lg font-medium leading-none text-primary transition-all hover:border-primary/40 hover:bg-page/10"
                      >
                        {isExpanded ? "−" : "+"}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium text-txt-primary">
                              {info.title}
                            </p>

                            <p className="mt-0.5 text-xs leading-relaxed text-txt-secondary">
                              {info.description}
                            </p>
                          </div>

                          <input
                            type="checkbox"
                            checked={localConsent[category]}
                            disabled={isEssential}
                            onChange={(event) => {
                              if (category === "essential") {
                                return;
                              }

                              handleToggle(category, event.target.checked);
                            }}
                            aria-label={info.title}
                            className="h-4 w-4 flex-shrink-0 rounded border-br-secondary text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="space-y-3 border-t border-br-secondary bg-surface-card/40 px-4 py-3">
                      <div>
                        <h4 className="mb-1.5 text-xs font-medium text-txt-primary">
                          What these cookies do
                        </h4>

                        <ul className="space-y-1.5 text-xs text-txt-secondary">
                          {info.details.map((detail) => (
                            <li key={detail} className="flex items-start gap-2">
                              <span className="mt-[1px] text-primary">•</span>

                              <span className="leading-relaxed">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-1.5 text-xs font-medium text-txt-primary">
                          Examples
                        </h4>

                        <ul className="space-y-1.5 text-xs text-txt-secondary">
                          {info.examples.map((example) => (
                            <li key={example} className="flex items-start gap-2">
                              <span className="mt-[1px] text-primary">•</span>

                              <span className="leading-relaxed">{example}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg border border-br-secondary bg-page/50 p-2.5">
                        <h4 className="mb-1 text-xs font-medium text-txt-primary">
                          Impact of disabling
                        </h4>

                        <p className="text-xs leading-relaxed text-txt-secondary">
                          {info.impact}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-br-secondary bg-section px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleDeclineNonEssentials}
              className="min-w-[135px] rounded-lg border border-br-secondary px-4 py-2 text-xs font-medium text-txt-secondary transition-colors hover:border-br-primary hover:bg-surface-card hover:text-txt-primary"
            >
              Decline
            </button>

            <button
              type="button"
              onClick={handleSaveSettings}
              className="min-w-[135px] rounded-lg border border-primary/40 bg-page/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-page/15"
            >
              Save Preferences
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="min-w-[135px] rounded-lg bg-page px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-page/90"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
