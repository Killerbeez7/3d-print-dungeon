import { useState, useRef, useEffect, RefObject, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
// hooks
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useUserRole } from "@/features/auth/hooks/useUserRole";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useModal } from "@/features/shared/modal/hooks/useModal"; // NEW
// configs
import { NAV_SECTIONS } from "@/config/navConfig";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import { ROUTES } from "@/constants/routeConstants";
// components
import { AuthButtons } from "./AuthButtons";
import { GlobalSearch } from "@/features/search/components/GlobalSearch";
import { NotificationDropdown } from "@/features/user/notifications";
// icons
import type { IconType } from "react-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  MdFileUpload,
  MdAccountCircle,
  MdMenu,
  MdClose,
  MdSearch,
  MdArticle,
  MdBusinessCenter,
  MdCollections,
  MdEvent,
  MdForum,
  MdInventory2,
  MdPeople,
  MdPrecisionManufacturing,
  MdPrint,
  MdStorefront,
  MdViewModule,
} from "react-icons/md";
import {
  faSignOutAlt,
  faUser,
  faCog,
  faChevronDown,
} from "@fortawesome/free-solid-svg-icons";
import type { NavSection } from "@/types/navbar";
import { toUrlSafeUsername } from "@/utils/stringUtils";

const navItemIcons: Record<string, IconType> = {
  Models: MdViewModule,
  Artists: MdPeople,
  Collections: MdCollections,
  Events: MdEvent,
  Forum: MdForum,
  Blog: MdArticle,
  Marketplace: MdStorefront,
  "Printed Figures": MdPrint,
  "Bulk Orders": MdInventory2,
  "Custom Solutions": MdPrecisionManufacturing,
  "Enterprise Suite": MdBusinessCenter,
};

const NavbarAuthSkeleton = () => {
  return (
    <div className="flex h-10 items-center justify-end gap-3" aria-hidden="true">
      <div className="h-7 w-7 animate-pulse rounded-lg bg-surface-card" />
      <div className="h-7 w-7 animate-pulse rounded-lg bg-surface-card" />
      <div className="h-7 w-7 animate-pulse rounded-full bg-surface-card" />
    </div>
  );
};

export const Navbar = () => {
  const { isAdmin } = useUserRole();
  const { authUser, currentUser, publicProfile, handleSignOut, loading } = useAuth();
  const { open } = useModal("auth");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement | null>(null);
  const mobileDropdownRef = useRef<HTMLDivElement | null>(null);

  // helpers
  const closeAll = useCallback((): void => {
    setActiveDropdown(null);
    setMobileDropdown(null);
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogoClick = (): void => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const toggleDropdown = (dropdownName: string): void => {
    setActiveDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const toggleMobileMenu = (): void => {
    setIsMobileMenuOpen((prev) => {
      if (prev) setMobileDropdown(null);
      return !prev;
    });
  };

  const toggleMobileDropdown = (
    dropdownName: string,
    e: React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.stopPropagation();
    setMobileDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await handleSignOut();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleSearchClick = (): void => {
    navigate(`${ROUTES.SEARCH}?sort_by=relevance`);
  };

  // Outside click and route change cleanup.

  useClickOutside(desktopNavRef as RefObject<HTMLElement>, () => {
    setActiveDropdown((prev) => (prev === "profile" ? prev : null));
  });

  useClickOutside(profileDropdownRef as RefObject<HTMLElement>, () => {
    setActiveDropdown((prev) => (prev === "profile" ? null : prev));
  });

  useClickOutside(mobileDropdownRef as RefObject<HTMLElement>, () => {
    setMobileDropdown(null);
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
      <nav className="relative z-50 border-b border-br-subtle/80 bg-section/90 shadow-sm backdrop-blur-md">
        <div className="h-[72px] px-4 sm:px-6 lg:px-8">
          <div
            className="
    grid h-full min-w-0
    grid-cols-[auto_minmax(0,1fr)_auto]
    items-center gap-x-4
    lg:grid-cols-[384px_minmax(220px,1fr)_168px]
    lg:gap-x-6
  "
          >
            {/* LEFT */}
            <div className="flex min-w-0 items-center gap-4">
              {/* mobile hamburger */}
              <button
                id="hamburger-button"
                type="button"
                className="md:hidden p-[0.5px] rounded-lg text-txt-secondary hover:bg-surface-card"
                onClick={toggleMobileMenu}
                aria-label="Toggle mobile menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <MdClose size={30} /> : <MdMenu size={30} />}
              </button>

              {/* logo mobile */}
              <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 md:hidden">
                <Link to="/" className="flex h-full w-full items-center justify-center">
                  <img
                    src={STATIC_ASSETS.LOGO}
                    alt="3D Print Dungeon"
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain logo-accent"
                  />
                </Link>
              </div>

              {/* Logo desktop */}
              <div className="hidden h-10 w-[50px] shrink-0 items-center md:flex">
                <Link
                  to="/"
                  className="flex h-10 w-10 items-center justify-center"
                  onClick={handleLogoClick}
                >
                  <img
                    src={STATIC_ASSETS.LOGO}
                    alt="3D Print Dungeon"
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain transition-transform duration-200 hover:scale-105 logo-accent"
                  />
                </Link>
              </div>

              {/* desktop nav */}
              <nav
                ref={desktopNavRef}
                className="hidden items-center gap-5 md:flex"
                aria-label="Primary navigation"
              >
                {(NAV_SECTIONS as NavSection[]).map((section) => (
                  <div
                    key={section.label}
                    className="relative group"
                    onMouseEnter={() => setActiveDropdown(section.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <button
                      type="button"
                      className={`relative inline-flex h-10 items-center whitespace-nowrap px-1 text-sm font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-accent after:transition-opacity after:duration-200 hover:text-txt-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
                        activeDropdown === section.label
                          ? "text-txt-primary after:opacity-100"
                          : "text-txt-secondary after:opacity-0 group-hover:after:opacity-100"
                      }`}
                      onClick={() => toggleDropdown(section.label)}
                      aria-haspopup="menu"
                      aria-expanded={activeDropdown === section.label}
                    >
                      {section.label}
                    </button>
                    {/* Desktop Dropdown */}
                    <div
                      role="menu"
                      className={`absolute left-0 mt-2 w-52 rounded-lg shadow-lg bg-surface-elevated border border-br-secondary transition-all duration-200 p-2 z-40 ${
                        activeDropdown === section.label
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                    >
                      <div>
                        {section.items.map((item) => {
                          const ItemIcon = navItemIcons[item.label];

                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              role="menuitem"
                              className="group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-txt-secondary hover:bg-surface-card hover:text-txt-primary hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-br-primary"
                              onClick={() => setActiveDropdown(null)}
                            >
                              {ItemIcon && (
                                <ItemIcon
                                  className="h-4 w-4 flex-shrink-0 text-txt-secondary transition-colors group-hover:text-txt-primary"
                                  aria-hidden="true"
                                />
                              )}
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* CENTER: global search */}
            <div className="hidden min-w-0 w-full justify-self-center lg:block">
              <div className="mx-auto w-full max-w-5xl">
                <GlobalSearch />
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex min-w-0 items-center justify-end gap-3">
              {/* Quick search icon */}
              <button
                type="button"
                onClick={handleSearchClick}
                className="hidden md:block lg:hidden rounded-lg p-1 text-txt-secondary hover:bg-surface-card hover:text-txt-primary focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-br-primary"
                title="Search"
                aria-label="Search"
              >
                <MdSearch className="h-7 w-7" />
              </button>

              {loading ? (
                <NavbarAuthSkeleton />
              ) : !currentUser ? (
                <AuthButtons
                  isLoading={false}
                  onLoginClick={() => {
                    open({ mode: "signin" });
                  }}
                  onSignUpClick={() => {
                    open({ mode: "signup" });
                  }}
                />
              ) : (
                <>
                  {/* Desktop buttons */}
                  <div className="hidden items-center gap-3 md:flex">
                    <Link
                      to="/model/upload"
                      className="rounded-lg p-1 text-txt-secondary hover:bg-surface-card hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-br-primary"
                      title="Upload Model"
                      aria-label="Upload Model"
                    >
                      <MdFileUpload className="h-7 w-7" />
                    </Link>

                    <NotificationDropdown className="text-txt-secondary" />
                  </div>

                  {/* Profile Dropdown */}
                  <div className="relative" ref={profileDropdownRef}>
                    <button
                      id="profile-button"
                      type="button"
                      onClick={() => {
                        toggleDropdown("profile");
                      }}
                      className={`flex items-center rounded-lg p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/30 ${
                        activeDropdown === "profile"
                          ? "bg-muted text-txt-primary"
                          : "text-txt-secondary hover:bg-muted hover:text-txt-primary"
                      }`}
                      aria-label="Profile menu"
                      aria-haspopup="menu"
                      aria-expanded={activeDropdown === "profile"}
                    >
                      <MdAccountCircle className="size-7" />
                    </button>

                    {/* Profile dropdown */}
                    <div
                      role="menu"
                      className={`absolute right-0 top-full z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-br-subtle bg-surface-elevated shadow-xl transition-[opacity,transform] duration-150 ease-out ${
                        activeDropdown === "profile"
                          ? "visible translate-y-0 opacity-100"
                          : "invisible translate-y-1 opacity-0"
                      }`}
                    >
                      <div className="p-2">
                        {/* User */}
                        <div className="flex items-center gap-3 px-3 py-3">
                          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-txt-primary">
                            {profileAvatarSrc ? (
                              <img
                                src={profileAvatarSrc}
                                alt={`${profileDisplayName} profile`}
                                referrerPolicy="no-referrer"
                                className="size-full object-cover"
                                onError={(event) => {
                                  const image = event.currentTarget;

                                  if (image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
                                    return;
                                  }

                                  image.src = STATIC_ASSETS.DEFAULT_AVATAR;
                                }}
                              />
                            ) : (
                              <MdAccountCircle className="size-8" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-txt-primary">
                              {profileDisplayName}
                            </p>

                            <p className="mt-0.5 truncate text-xs text-txt-muted">
                              {profileEmail}
                            </p>
                          </div>
                        </div>

                        <div className="my-1.5 border-t border-br-subtle" />

                        {/* Account actions */}
                        <div>
                          {isAdmin && (
                            <Link
                              to="/admin-dashboard"
                              role="menuitem"
                              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-muted/60 hover:text-txt-primary"
                              onClick={() => {
                                setActiveDropdown(null);
                              }}
                            >
                              <MdViewModule
                                className="size-4 text-txt-muted"
                                aria-hidden="true"
                              />

                              <span>Admin Dashboard</span>
                            </Link>
                          )}

                          <Link
                            to={`/${urlSafeUsername}`}
                            role="menuitem"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-muted/60 hover:text-txt-primary"
                            onClick={() => {
                              setActiveDropdown(null);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faUser}
                              className="w-4 text-txt-muted"
                            />

                            <span>View Profile</span>
                          </Link>

                          <Link
                            to="/forum/help"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-muted/60 hover:text-txt-primary"
                            onClick={() => {
                              setActiveDropdown(null);
                            }}
                          >
                            <MdForum
                              className="size-4 text-txt-muted"
                              aria-hidden="true"
                            />

                            <span>Help Center</span>
                          </Link>

                          <Link
                            to="/settings"
                            role="menuitem"
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-muted/60 hover:text-txt-primary"
                            onClick={() => {
                              setActiveDropdown(null);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faCog}
                              className="w-4 text-txt-muted"
                            />

                            <span>Account Settings</span>
                          </Link>
                        </div>

                        <div className="my-1.5 border-t border-br-subtle" />

                        {/* Logout */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setActiveDropdown(null);
                            void handleLogout();
                          }}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-error/10 hover:text-error"
                        >
                          <FontAwesomeIcon
                            icon={faSignOutAlt}
                            className="w-4 text-txt-muted"
                          />

                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-20"
          onClick={closeAll}
        />
      )}

      {/* ---------- Mobile drawer ---------- */}

      <div
        className={`md:hidden shadow-md divider-top bg-section border-b border-br-subtle absolute inset-x-0 transition-all duration-300 ease-in-out transform z-30 ${
          isMobileMenuOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
        style={{ top: "100%" }}
      >
        {/* Mobile action buttons */}
        {currentUser && (
          <div className="flex items-center justify-center space-x-8 p-4">
            <Link
              to="/model/upload"
              className="text-txt-secondary hover:text-txt-primary"
              title="Upload Model"
              aria-label="Upload Model"
            >
              <MdFileUpload className="h-7 w-7" />
            </Link>

            <NotificationDropdown className="text-txt-secondary hover:text-txt-primary" />
          </div>
        )}

        {/* Mobile Search */}
        <div className="p-4 divider-top">
          <GlobalSearch />
        </div>

        <div className="px-2 pt-2 h-auto pb-3 space-y-1" ref={mobileDropdownRef}>
          {(NAV_SECTIONS as NavSection[]).map((section) => (
            <div key={section.label}>
              <button
                type="button"
                className={`w-full text-left px-4 py-2 text-txt-secondary hover:rounded-md hover:bg-section hover:text-txt-primary flex items-center justify-between ${
                  mobileDropdown === section.label
                    ? "bg-surface-card rounded-md text-txt-primary font-semibold"
                    : ""
                }`}
                onClick={(e) => toggleMobileDropdown(section.label, e)}
                aria-expanded={mobileDropdown === section.label}
              >
                {section.label}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`ml-2 transform transition-transform duration-200 ${
                    mobileDropdown === section.label ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-200 rounded-md ${
                  mobileDropdown === section.label
                    ? "max-h-48 overflow-y-auto"
                    : "max-h-0 overflow-hidden"
                }`}
              >
                {section.items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-6 py-2 text-md text-txt-secondary hover:bg-section hover:text-txt-primary"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setMobileDropdown(null);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
