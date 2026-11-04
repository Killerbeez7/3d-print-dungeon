import { useState } from "react";
import { Link } from "react-router-dom";
import { Upload } from "lucide-react";

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
      { label: "Forum rules", to: FORUM_PATHS.RULES },
      { label: "Help center", to: FORUM_PATHS.HELP },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Upload a model", to: ROUTES.MODEL_UPLOAD },
      { label: "Settings", to: ROUTES.USER_SETTINGS },
      { label: "Notifications", to: ROUTES.USER_NOTIFICATIONS },
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
      <footer className="border-t border-br-subtle bg-section">
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

          <div className="mt-12 flex items-center justify-between gap-4 border-t border-br-subtle py-6 text-xs text-txt-muted">
            <p>© {new Date().getFullYear()} 3D Print Dungeon</p>
            <p className="label-mono text-[0.65rem]">Printed layer by layer</p>
          </div>
        </div>
      </footer>

      <CookieSettingsModal
        isOpen={showCookieSettings}
        onClose={() => setShowCookieSettings(false)}
      />
    </>
  );
};
