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
import { STATIC_ASSETS } from "@/config/assetsConfig";
import { ROUTES } from "@/constants/routeConstants";
// components
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { ProfileMenu } from "./ProfileMenu";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { NotificationDropdown } from "@/features/user/notifications";
import { toUrlSafeUsername } from "@/utils/stringUtils";

const iconButtonClass =
  "flex size-10 items-center justify-center rounded-lg text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const navLinkClass = (isActive: boolean) =>
  `relative inline-flex h-10 items-center gap-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
    isActive ? "text-txt-primary bg-muted" : "text-txt-secondary hover:bg-muted/60 hover:text-txt-primary"
  }`;

const NavbarAuthSkeleton = () => (
  <div className="flex h-10 items-center justify-end gap-2" aria-hidden="true">
    <div className="h-9 w-20 animate-pulse rounded-md bg-surface-card" />
    <div className="size-9 animate-pulse rounded-full bg-surface-card" />
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
      <header className="relative z-50 border-b border-br-subtle bg-section/95 backdrop-blur-md">
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
            <img
              src={STATIC_ASSETS.LOGO}
              alt=""
              width={36}
              height={36}
              className="size-9 object-contain logo-accent"
            />
            <span className="hidden text-sm font-semibold tracking-tight text-txt-primary xl:inline">
              3D Print Dungeon
            </span>
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
                    className={`absolute left-0 top-full z-40 w-48 pt-2 transition-opacity duration-150 ${
                      activeDropdown === section.label ? "visible opacity-100" : "invisible opacity-0"
                    }`}
                  >
                    <div className="rounded-xl border border-br-subtle bg-surface-elevated p-1.5 shadow-xl">
                      {section.items.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          role="menuitem"
                          className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-txt-secondary hover:bg-muted hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus"
                          onClick={() => setActiveDropdown(null)}
                        >
                          {item.label}
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
                  className="hidden h-9 items-center gap-2 rounded-md border border-br-secondary bg-surface-card px-3 text-sm font-semibold text-txt-primary transition-colors hover:border-br-primary hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus md:inline-flex"
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
