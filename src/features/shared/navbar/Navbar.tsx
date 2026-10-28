import { useState, useRef, useEffect, RefObject, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { ChevronDown, Menu, Search, Upload } from "lucide-react";
// hooks
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserRole } from "@/features/auth/hooks/useUserRole";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useModal } from "@/features/shared/modal/hooks/useModal";
// configs
import { NAV_SECTIONS } from "@/config/navConfig";
import { ROUTES } from "@/constants/routeConstants";
// components
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { ProfileMenu } from "./ProfileMenu";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { NotificationDropdown } from "@/features/user/notifications";
import { buttonClassName } from "@/components";
import { BrandMark } from "@/features/shared/components/BrandMark";
import { toUrlSafeUsername } from "@/utils/stringUtils";

const iconButtonClass =
  "flex size-10 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

// Underline grows from the left on hover and stays on the active link.
const navLinkClass = (isActive: boolean) =>
  `relative inline-flex h-10 items-center gap-1 whitespace-nowrap px-3 text-sm font-medium transition-colors after:absolute after:inset-x-3 after:bottom-1 after:h-0.5 after:origin-left after:bg-accent after:transition-transform after:duration-300 after:ease-forge ${
    isActive
      ? "text-txt-primary after:scale-x-100"
      : "text-txt-secondary after:scale-x-0 hover:text-txt-primary hover:after:scale-x-100"
  }`;

const NavbarAuthSkeleton = () => (
  <div className="flex h-10 items-center justify-end gap-2" aria-hidden="true">
    <div className="skeleton-print chamfer h-9 w-20 [--cut:7px]" />
    <div className="skeleton-print chamfer size-10 [--cut:7px]" />
  </div>
);

export const Navbar = () => {
  const { isAdmin } = useUserRole();
  const { authUser, currentUser, publicProfile, handleSignOut, loading } = useAuth();
  const { open } = useModal("auth");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const desktopNavRef = useRef<HTMLDivElement | null>(null);

  const closeAll = useCallback((): void => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);
  }, []);

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  const handleLogoClick = (event: React.MouseEvent): void => {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleDropdown = (dropdownName: string): void => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await handleSignOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const openAuth = (mode: "signin" | "signup") => {
    setIsMobileMenuOpen(false);
    open({ mode });
  };

  useClickOutside(desktopNavRef as RefObject<HTMLElement>, () => {
    setActiveDropdown((prev) => (prev === "profile" ? prev : null));
  });

  useEffect(() => {
    closeAll();
  }, [closeAll, location.pathname]);

  const urlSafeUsername = toUrlSafeUsername(publicProfile?.username);
  const profileAvatarSrc = authUser?.photoURL ?? currentUser?.photoURL ?? null;
  const profileDisplayName =
    authUser?.username ?? authUser?.displayName ?? currentUser?.displayName ?? "User";
  const profileEmail = authUser?.email ?? currentUser?.email ?? "";

  return (
    <div className="sticky top-0 left-0 right-0 z-50">
      <header className="relative z-50 border-b border-br-subtle bg-section/85 backdrop-blur-xl">
        {/* Print progress: fills as the page scrolls (CSS scroll timeline). */}
        <div className="scroll-progress" aria-hidden="true" />
        <div className="relative mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:px-6 md:gap-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            id="hamburger-button"
            type="button"
            className={`${iconButtonClass} -ml-1 md:hidden`}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus max-md:absolute max-md:left-1/2 max-md:-translate-x-1/2"
            aria-label="3D Print Dungeon home"
          >
            <BrandMark wordmarkClassName="max-xl:hidden" />
          </Link>

          {/* Desktop nav */}
          <nav
            ref={desktopNavRef}
            className="ml-2 hidden items-center gap-1 md:flex"
            aria-label="Primary navigation"
          >
            {NAV_SECTIONS.map((section) =>
              section.to ? (
                <NavLink
                  key={section.label}
                  to={section.to}
                  end={section.to === "/"}
                  className={({ isActive }) => navLinkClass(isActive)}
                >
                  {section.label}
                </NavLink>
              ) : (
                <div
                  key={section.label}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(section.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button
                    type="button"
                    className={navLinkClass(activeDropdown === section.label)}
                    onClick={() => toggleDropdown(section.label)}
                    aria-haspopup="menu"
                    aria-expanded={activeDropdown === section.label}
                  >
                    {section.label}
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        activeDropdown === section.label ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    role="menu"
                    className={`absolute left-0 top-full z-40 pt-2 transition-[opacity,transform] duration-200 ease-forge ${
                      activeDropdown === section.label
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="w-60 rounded-xl border border-br-secondary bg-surface-elevated p-1.5 shadow-2xl shadow-black/40">
                      {section.items.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          className="group/item flex flex-col rounded-lg px-3 py-2.5 transition-colors hover:bg-muted"
                          onClick={() => setActiveDropdown(null)}
                        >
                          <span className="text-sm font-medium text-txt-primary">
                            {item.label}
                            <span
                              className="ml-1 inline-block text-accent opacity-0 transition-[opacity,transform] duration-200 group-hover/item:translate-x-0.5 group-hover/item:opacity-100"
                              aria-hidden="true"
                            >
                              →
                            </span>
                          </span>
                          {item.hint && <span className="text-xs text-txt-muted">{item.hint}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </nav>

          {/* Search (desktop) */}
          <div className="mx-auto hidden w-full min-w-0 max-w-xl flex-1 lg:block">
            <GlobalSearch />
          </div>

          {/* Right side */}
          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
            <Link
              to={`${ROUTES.SEARCH}?sort_by=relevance`}
              className={`${iconButtonClass} lg:hidden`}
              aria-label="Search"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>

            {loading ? (
              <NavbarAuthSkeleton />
            ) : !currentUser ? (
              <AuthButtons
                onLoginClick={() => openAuth("signin")}
                onSignUpClick={() => openAuth("signup")}
              />
            ) : (
              <>
                <Link
                  to="/model/upload"
                  className={buttonClassName({
                    variant: "secondary",
                    size: "sm",
                    className: "max-md:hidden",
                  })}
                >
                  <Upload className="size-4" aria-hidden="true" />
                  Upload
                </Link>

                <NotificationDropdown className="text-txt-secondary" />

                <ProfileMenu
                  isOpen={activeDropdown === "profile"}
                  onToggle={() => toggleDropdown("profile")}
                  onClose={() => setActiveDropdown(null)}
                  onLogout={() => void handleLogout()}
                  isAdmin={isAdmin}
                  displayName={profileDisplayName}
                  username={publicProfile?.username ?? null}
                  email={profileEmail}
                  avatarSrc={profileAvatarSrc}
                  profilePath={`/${urlSafeUsername}`}
                />
              </>
            )}
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
        sections={NAV_SECTIONS}
        isSignedIn={Boolean(currentUser)}
        onSignIn={() => openAuth("signin")}
        onSignUp={() => openAuth("signup")}
      />
    </div>
  );
};
