import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, NavLink } from "react-router-dom";
import FocusLock from "react-focus-lock";
import { Upload, X } from "lucide-react";

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

interface MenuLinkProps extends NavItem {
  isOpen: boolean;
  order: number;
  primary?: boolean;
  onClose: () => void;
}

/** One row: icon + label, a soft highlight on the current page. Slides in after the drawer. */
const MenuLink = ({
  label,
  to,
  icon: Icon,
  isOpen,
  order,
  primary = false,
  onClose,
}: MenuLinkProps) => (
  <li
    className="transition-[opacity,transform] duration-500 ease-forge"
    style={{
      transitionDelay: isOpen ? `${80 + order * 35}ms` : "0ms",
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? "none" : "translateX(-12px)",
    }}
  >
    <NavLink
      to={to}
      end={to === "/"}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 text-[15px] transition-colors ${
          primary ? "h-12 font-medium" : "h-11"
        } ${
          isActive
            ? "bg-accent-soft text-accent-text"
            : `${primary ? "text-txt-primary" : "text-txt-secondary"} hover:bg-muted hover:text-txt-primary`
        }`
      }
    >
      {({ isActive }) => (
        <>
          {Icon && (
            <Icon
              className={`${primary ? "size-5" : "size-[18px]"} shrink-0 ${
                isActive ? "text-accent-text" : "text-txt-muted"
              }`}
              aria-hidden="true"
            />
          )}
          {label}
        </>
      )}
    </NavLink>
  </li>
);

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

  // The top-level pages first, then each menu's links under its own heading.
  const primary = sections.filter((section) => section.to);
  const groups = sections.filter((section) => !section.to && section.items.length);
  let order = 0;

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
          // Focus lands on the panel itself when the menu opens, not on the logo link, so no
          // ring shows until the user tabs. The panel is not a control, so it draws no outline.
          tabIndex={-1}
          data-autofocus
          className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-br-secondary bg-section shadow-2xl outline-none transition-transform duration-300 ease-forge ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-br-subtle pl-4 pr-2">
            <Link to="/" onClick={onClose} aria-label="3D Print Dungeon home">
              <BrandMark size="sm" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="flex size-10 items-center justify-center rounded-lg text-txt-secondary hover:bg-muted hover:text-txt-primary"
              aria-label="Close menu"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">
            <div className="px-1">
              <GlobalSearch />
            </div>

            <nav aria-label="Mobile navigation" className="mt-4">
              <ul className="space-y-0.5">
                {primary.map((section) => (
                  <MenuLink
                    key={section.label}
                    label={section.label}
                    to={section.to as string}
                    icon={section.icon}
                    primary
                    isOpen={isOpen}
                    order={order++}
                    onClose={onClose}
                  />
                ))}
              </ul>

              {groups.map((group) => (
                <div key={group.label} className="mt-5">
                  <p className="label-mono mb-1 px-3 text-txt-muted">{group.label}</p>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <MenuLink
                        key={item.to}
                        {...item}
                        isOpen={isOpen}
                        order={order++}
                        onClose={onClose}
                      />
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <div className="shrink-0 space-y-3 border-t border-br-subtle bg-section p-4">
            <div className="flex items-center justify-between">
              <span className="label-mono text-txt-muted">Theme</span>
              <ThemeToggle />
            </div>
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
              <div className="grid grid-cols-2 gap-2">
                <Button size="lg" variant="secondary" fullWidth onClick={onSignIn}>
                  Sign in
                </Button>
                <Button size="lg" fullWidth onClick={onSignUp}>
                  Sign up
                </Button>
              </div>
            )}
          </div>
        </div>
      </FocusLock>
    </div>,
    document.body,
  );
};
