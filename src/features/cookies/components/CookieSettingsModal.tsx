import { useState, useEffect } from "react";
import FocusLock from "react-focus-lock";
import { ChevronDown, Lock, X } from "lucide-react";

import "@/styles/customScrollbar.css";

import { Button } from "@/components";

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
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <FocusLock returnFocus className="contents">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
          className="auth-panel relative flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-br-secondary bg-surface-card shadow-popover md:rounded-xl"
        >
          <div className="flex items-start justify-between gap-4 border-b border-br-subtle px-5 py-4">
            <div>
              <p className="label-mono text-accent">Privacy</p>
              <h2 id="cookie-settings-title" className="mt-1 text-lg font-bold">
                Cookie settings
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-txt-secondary">
                Choose which optional cookies you allow. Essential cookies are always enabled.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close cookie settings"
              className="flex size-9 shrink-0 items-center justify-center rounded-md text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <ul className="custom-scrollbar-md flex-1 divide-y divide-br-subtle overflow-y-auto">
            {categoryEntries.map(([category, info]) => {
              const isExpanded = expandedSections.has(category);
              const isEssential = category === "essential";
              const detailsId = `cookie-${category}-details`;

              return (
                <li key={category} className="px-5 py-4">
                  <div className="flex items-start gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 text-sm font-semibold text-txt-primary">
                        {info.title}
                        {isEssential && (
                          <span className="label-mono inline-flex items-center gap-1 text-txt-muted">
                            <Lock className="size-3" aria-hidden="true" /> Always on
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-txt-secondary">{info.description}</p>
                      <button
                        type="button"
                        onClick={() => toggleSection(category)}
                        aria-expanded={isExpanded}
                        aria-controls={detailsId}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent"
                      >
                        {isExpanded ? "Hide details" : "Details"}
                        <ChevronDown
                          className={`size-3.5 transition-transform duration-300 ease-forge ${isExpanded ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer has-[:disabled]:cursor-not-allowed">
                      <input
                        type="checkbox"
                        role="switch"
                        checked={localConsent[category]}
                        disabled={isEssential}
                        onChange={(event) => {
                          if (category === "essential") return;
                          handleToggle(category, event.target.checked);
                        }}
                        aria-label={info.title}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="relative h-6 w-11 rounded-full bg-br-input transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-page after:transition-transform after:duration-300 after:ease-forge peer-checked:bg-btn-primary peer-checked:after:translate-x-5 peer-disabled:opacity-60 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus"
                      />
                    </label>
                  </div>

                  {isExpanded && (
                    <div id={detailsId} className="mt-3 grid gap-4 rounded-lg bg-section p-4 text-sm sm:grid-cols-2">
                      <div>
                        <p className="label-mono mb-1.5 text-txt-muted">What they do</p>
                        <ul className="space-y-1 text-txt-secondary">
                          {info.details.map((detail) => (
                            <li key={detail}>{detail}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="label-mono mb-1.5 text-txt-muted">Examples</p>
                        <ul className="space-y-1 text-txt-secondary">
                          {info.examples.map((example) => (
                            <li key={example}>{example}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-txt-secondary sm:col-span-2">
                        <span className="font-semibold text-txt-primary">If disabled: </span>
                        {info.impact}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="grid grid-cols-2 gap-2 border-t border-br-subtle bg-section px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:flex sm:justify-end">
            <Button variant="secondary" size="sm" onClick={handleDeclineNonEssentials}>
              Reject optional
            </Button>
            <Button variant="secondary" size="sm" onClick={handleAcceptAll}>
              Accept all
            </Button>
            <Button size="sm" onClick={handleSaveSettings} className="col-span-2">
              Save choices
            </Button>
          </div>
        </div>
      </FocusLock>
    </div>
  );
}
