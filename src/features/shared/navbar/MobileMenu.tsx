import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import FocusLock from "react-focus-lock";
import { ArrowUpRight, Upload, X } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import type { NavItem, NavSection } from "@/config/navConfig";
import { BrandMark } from "@/features/shared/components/BrandMark";
import { ThemeToggle } from "@/features/shared/components/ThemeToggle";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
  isSignedIn: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
}

interface NumberedLink extends NavItem {
  index: number;
}

export const MobileMenu = ({
  isOpen,
  onClose,
  sections,
  isSignedIn,
  onSignIn,
  onSignUp,
}: MobileMenuProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Number every link in reading order: 01 Models, 02 Artists, ...
  let counter = 0;
  const groups: { label: string; links: NumberedLink[] }[] = [
    {
      label: "Explore",
      links: sections
        .filter((section) => section.to)
        .map((section) => ({ label: section.label, to: section.to as string, index: ++counter })),
    },
    ...sections
      .filter((section) => !section.to && section.items.length)
      .map((section) => ({
        label: section.label,
        links: section.items.map((item) => ({ ...item, index: ++counter })),
      })),
  ];

  // Portalled so it sits above the sticky header's stacking context and the
  // cookie banner (z-50), but below the auth modal.
  return createPortal(
    <div
      className={`fixed inset-0 z-[70] md:hidden ${isOpen ? "" : "pointer-events-none"}`}
      inert={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-surface-overlay backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <FocusLock disabled={!isOpen} returnFocus>
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className={`bg-layer-lines absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-br-secondary bg-section shadow-2xl transition-transform duration-300 ease-forge ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-br-subtle px-4">
            <Link to="/" onClick={onClose} aria-label="3D Print Dungeon home">
              <BrandMark />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-lg text-txt-secondary hover:bg-muted hover:text-txt-primary"
              aria-label="Close menu"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-5">
            <GlobalSearch />

            <nav aria-label="Mobile navigation" className="mt-6 space-y-7">
              {groups.map((group) => (
                <div key={group.label}>
                  <p className="label-mono mb-1 text-txt-muted">{group.label}</p>
                  <ul>
                    {group.links.map((link) => (
                      <li
                        key={link.to}
                        className="transition-[opacity,transform] duration-500 ease-forge"
                        style={{
                          transitionDelay: isOpen ? `${80 + link.index * 35}ms` : "0ms",
                          opacity: isOpen ? 1 : 0,
                          transform: isOpen ? "none" : "translateX(-12px)",
                        }}
                      >
                        <NavLink
                          to={link.to}
                          end={link.to === "/"}
                          onClick={onClose}
                          className={({ isActive }) =>
                            `group flex min-h-13 items-center gap-4 border-b border-br-subtle py-2 ${
                              isActive ? "text-accent" : "text-txt-primary"
                            }`
                          }
                        >
                          <span className="font-mono text-xs text-txt-muted">
                            {String(link.index).padStart(2, "0")}
                          </span>
                          <span className="flex-1 font-display text-lg font-semibold tracking-tight">
                            {link.label}
                          </span>
                          <ArrowUpRight
                            className="size-4 text-txt-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
                            aria-hidden="true"
                          />
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>

            <div className="mt-7 flex items-center justify-between">
              <span className="label-mono text-txt-muted">Theme</span>
              <ThemeToggle />
            </div>
          </div>

          <div className="shrink-0 space-y-2 border-t border-br-subtle bg-section p-4">
            {isSignedIn ? (
              <Link
                to="/model/upload"
                onClick={onClose}
                className={buttonClassName({ size: "lg", fullWidth: true })}
              >
                <Upload className="size-5" aria-hidden="true" />
                Upload a model
              </Link>
            ) : (
              <>
                <Button size="lg" fullWidth onClick={onSignUp}>
                  Sign up
                </Button>
                <Button size="lg" variant="secondary" fullWidth onClick={onSignIn}>
                  Sign in
                </Button>
              </>
            )}
          </div>
        </div>
      </FocusLock>
    </div>,
    document.body
  );
};
