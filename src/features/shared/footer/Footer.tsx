import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, Upload } from "lucide-react";

import { buttonClassName } from "@/components";
import { ROUTES } from "@/constants/routeConstants";
import { CookieSettingsModal } from "@/features/cookies/components/CookieSettingsModal";
import { FORUM_PATHS } from "@/features/forum/constants/forumPaths";
import { BrandMark } from "@/features/shared/components/BrandMark";

interface FooterLink {
  label: string;
  to: string;
}

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Models", to: ROUTES.HOME },
      { label: "Artists", to: ROUTES.ARTISTS_LIST },
      { label: "Collections", to: ROUTES.COLLECTIONS },
      { label: "Search", to: `${ROUTES.SEARCH}?sort_by=relevance` },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Forum", to: FORUM_PATHS.HOME },
      { label: "Events", to: ROUTES.EVENTS },
      { label: "Blog", to: ROUTES.BLOG },
      { label: "Forum rules", to: "/forum/rules" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Upload a model", to: ROUTES.MODEL_UPLOAD },
      { label: "Settings", to: ROUTES.USER_SETTINGS },
      { label: "Notifications", to: ROUTES.USER_NOTIFICATIONS },
      { label: "Help center", to: "/forum/help" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of use", to: ROUTES.TERMS_OF_USE },
      { label: "Privacy policy", to: ROUTES.PRIVACY_POLICY },
      { label: "Cookie policy", to: ROUTES.COOKIE_POLICY },
      { label: "Refund policy", to: ROUTES.REFUND_POLICY },
    ],
  },
];

const linkClass =
  "group inline-flex min-h-9 items-center text-sm text-txt-secondary transition-colors hover:text-txt-primary";

export const Footer = () => {
  const [showCookieSettings, setShowCookieSettings] = useState<boolean>(false);

  return (
    <>
      <footer className="relative z-10 overflow-hidden border-t border-br-subtle bg-section">
        <div className="mx-auto max-w-[1600px] px-4 pt-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
            <div className="max-w-xs">
              <BrandMark size="lg" />
              <p className="mt-4 text-sm leading-relaxed text-txt-secondary">
                A community workshop for 3D printable tabletop models: find them, print them,
                share your own.
              </p>
              <Link
                to={ROUTES.MODEL_UPLOAD}
                className={buttonClassName({ variant: "secondary", size: "sm", className: "mt-5" })}
              >
                <Upload className="size-4" aria-hidden="true" />
                Share your model
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-4">
              {columns.map((column) => (
                <nav key={column.title} aria-label={column.title}>
                  <p className="label-mono mb-3 text-txt-muted">{column.title}</p>
                  <ul>
                    {column.links.map((link) => (
                      <li key={link.to}>
                        <Link to={link.to} className={linkClass}>
                          <span className="h-px w-0 bg-accent transition-[width,margin] duration-300 ease-forge group-hover:mr-2 group-hover:w-3" />
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    {column.title === "Legal" && (
                      <li>
                        <button
                          type="button"
                          onClick={() => setShowCookieSettings(true)}
                          className={linkClass}
                        >
                          <span className="h-px w-0 bg-accent transition-[width,margin] duration-300 ease-forge group-hover:mr-2 group-hover:w-3" />
                          Cookie settings
                        </button>
                      </li>
                    )}
                  </ul>
                </nav>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-br-subtle py-5 text-xs text-txt-muted sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} 3D Print Dungeon
              <span className="label-mono ml-3 hidden text-[0.65rem] sm:inline">
                Printed layer by layer
              </span>
            </p>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1.5 self-start text-txt-secondary transition-colors hover:text-txt-primary sm:self-auto"
            >
              Back to top
              <ArrowUp className="size-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Oversized outline wordmark, cut off by the page edge. */}
        <p
          aria-hidden="true"
          className="pointer-events-none -mb-[0.32em] select-none text-center font-display text-[13.5vw] font-bold uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--br-primary)]"
        >
          Dungeon
        </p>
      </footer>

      <CookieSettingsModal
        isOpen={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
      />
    </>
  );
};
