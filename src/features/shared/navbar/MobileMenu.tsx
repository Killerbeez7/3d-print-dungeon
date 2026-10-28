import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import FocusLock from "react-focus-lock";
import {
  BookOpen,
  CalendarDays,
  Images,
  LayoutGrid,
  MessagesSquare,
  Upload,
  Users,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import type { NavSection } from "@/config/navConfig";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";

const navIcons: Record<string, LucideIcon> = {
  Models: LayoutGrid,
  Artists: Users,
  Collections: Images,
  Forum: MessagesSquare,
  Events: CalendarDays,
  Blog: BookOpen,
};

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  sections: NavSection[];
  isSignedIn: boolean;
  onSignIn: () => void;
  onSignUp: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-12 items-center gap-3 rounded-lg px-3 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus ${
    isActive
      ? "bg-accent-soft text-accent-text"
      : "text-txt-secondary hover:bg-muted hover:text-txt-primary"
  }`;

const MenuLink = ({ to, label, onClose }: { to: string; label: string; onClose: () => void }) => {
  const Icon = navIcons[label];

  return (
    <NavLink to={to} end={to === "/"} className={linkClass} onClick={onClose}>
      {Icon && <Icon className="size-5 shrink-0" aria-hidden="true" />}
      <span>{label}</span>
    </NavLink>
  );
};

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

  const directLinks = sections.filter((section) => section.to);
  const groups = sections.filter((section) => !section.to && section.items.length);

  // Portalled so it sits above the sticky header's stacking context and the
  // cookie banner (z-50), but below the auth modal.
  return createPortal(
    <div
      className={`fixed inset-0 z-[70] md:hidden ${isOpen ? "" : "pointer-events-none"}`}
      inert={!isOpen}
    >
      <div
        className={`absolute inset-0 bg-surface-overlay transition-opacity duration-200 ${
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
          className={`absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-section shadow-xl transition-transform duration-200 ease-out ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-br-subtle px-4">
            <Link to="/" onClick={onClose} className="flex items-center gap-2 rounded-lg">
              <img
                src={STATIC_ASSETS.LOGO}
                alt=""
                width={32}
                height={32}
                className="size-8 object-contain logo-accent"
              />
              <span className="text-sm font-semibold text-txt-primary">3D Print Dungeon</span>
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-lg text-txt-secondary hover:bg-muted hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-focus"
              aria-label="Close menu"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="px-1 pb-4">
              <GlobalSearch />
            </div>

            <nav aria-label="Mobile navigation" className="space-y-6">
              <div className="space-y-1">
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-txt-muted">
                  Explore
                </p>
                {directLinks.map((section) => (
                  <MenuLink
                    key={section.label}
                    to={section.to as string}
                    label={section.label}
                    onClose={onClose}
                  />
                ))}
              </div>

              {groups.map((group) => (
                <div key={group.label} className="space-y-1">
                  <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-txt-muted">
                    {group.label}
                  </p>
                  {group.items.map((item) => (
                    <MenuLink key={item.to} to={item.to} label={item.label} onClose={onClose} />
                  ))}
                </div>
              ))}
            </nav>
          </div>

          <div className="shrink-0 space-y-2 border-t border-br-subtle p-4">
            {isSignedIn ? (
              <Link
                to="/model/upload"
                onClick={onClose}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-btn-primary px-5 text-base font-semibold text-btn-primary-text transition-colors hover:bg-btn-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
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
