import { useRef, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  Upload,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { ThemeToggle } from "@/features/shared/components/ThemeToggle";
import { UserAvatar } from "@/features/shared/components/UserAvatar";

interface ProfileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  displayName: string;
  username: string | null;
  email: string;
  /** Photo addresses to try in order (profile photo, then the sign-in provider's). */
  avatarSources: ReadonlyArray<string | null | undefined>;
  profilePath: string;
  /** Unread notifications: a dot on the avatar and a menu row on phones, where the bell is hidden. */
  unreadCount?: number;
}

interface Tile {
  to: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  featured?: boolean;
}

export const ProfileMenu = ({
  isOpen,
  onToggle,
  onClose,
  onLogout,
  isAdmin,
  displayName,
  username,
  email,
  avatarSources,
  profilePath,
  unreadCount = 0,
}: ProfileMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(menuRef as RefObject<HTMLElement>, () => {
    if (isOpen) onClose();
  });

  const tiles: Tile[] = [
    { to: "/model/upload", label: "Upload", hint: "Share a model", icon: Upload, featured: true },
    { to: profilePath, label: "Profile", hint: "Your page", icon: User },
    { to: "/settings", label: "Settings", hint: "Account", icon: Settings },
    { to: "/forum/help", label: "Help", hint: "Guides & FAQ", icon: LifeBuoy },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="profile-button"
        type="button"
        onClick={onToggle}
        className={`relative flex size-10 items-center justify-center transition-[filter,transform] duration-200 ${
          isOpen ? "brightness-110" : "hover:brightness-110"
        }`}
        aria-label={
          unreadCount > 0
            ? `Account menu, ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
            : "Account menu"
        }
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        {/* Same 40px tap area as the icons, with a lighter-looking avatar inside. */}
        <UserAvatar sources={avatarSources} className="size-7 md:size-8" />
        {unreadCount > 0 && (
          <span
            className="absolute right-0.5 top-0.5 size-2.5 rounded-full bg-ember-fill ring-2 ring-section md:hidden"
            aria-hidden="true"
          />
        )}
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-1.5rem)] origin-top-right overflow-hidden rounded-xl border border-br-secondary bg-surface-elevated shadow-popover transition-[opacity,transform,visibility] duration-200 ease-forge ${
          isOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        {/* Cover strip */}
        <div
          className="bg-layer-lines h-14 border-b border-br-subtle"
          style={{
            backgroundColor: "var(--accent-soft)",
          }}
          aria-hidden="true"
        />

        <div className="-mt-7 flex items-end gap-3 px-4">
          <span className="rounded-full bg-surface-elevated p-1.5">
            <UserAvatar sources={avatarSources} className="size-14 [--rim:2px]" />
          </span>
          <div className="min-w-0 flex-1 pb-1">
            <p className="truncate text-sm font-semibold text-txt-primary">{displayName}</p>
            <p className="truncate font-mono text-xs text-txt-muted">
              {username ? `@${username}` : email}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 p-3">
          {tiles.map(({ to, label, hint, icon: Icon, featured }) => (
            <Link
              key={label}
              to={to}
              role="menuitem"
              onClick={onClose}
              className={`group flex flex-col gap-3 rounded-lg border p-3 transition-[transform,border-color,background-color] duration-200 hover:-translate-y-0.5 ${
                featured
                  ? "border-accent/40 bg-accent-soft hover:border-accent"
                  : "border-br-subtle bg-surface-card hover:border-br-primary"
              }`}
            >
              <span
                className={`chamfer flex size-8 items-center justify-center [--cut:6px] ${
                  featured ? "bg-btn-primary text-btn-primary-text" : "bg-muted text-txt-secondary group-hover:text-txt-primary"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-sm font-semibold text-txt-primary">{label}</span>
                <span className="block text-xs text-txt-muted">{hint}</span>
              </span>
            </Link>
          ))}
        </div>

        <Link
          to="/notifications"
          role="menuitem"
          onClick={onClose}
          className="mx-3 mb-3 flex items-center gap-3 rounded-lg border border-br-subtle px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary md:hidden"
        >
          <Bell className="size-4" aria-hidden="true" />
          Notifications
          {unreadCount > 0 && (
            <span className="label-mono ml-auto rounded-full bg-ember-fill px-1.5 text-[0.65rem] leading-5 text-ember-on">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {isAdmin && (
          <Link
            to="/admin-dashboard"
            role="menuitem"
            onClick={onClose}
            className="mx-3 mb-3 flex items-center gap-3 rounded-lg border border-br-subtle px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:border-br-primary hover:text-txt-primary"
          >
            <LayoutDashboard className="size-4" aria-hidden="true" />
            Admin dashboard
          </Link>
        )}

        <div className="flex items-center justify-between border-t border-br-subtle px-4 py-3">
          <span className="label-mono text-txt-muted">Theme</span>
          <ThemeToggle />
        </div>

        <button
          type="button"
          role="menuitem"
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="flex w-full items-center gap-3 border-t border-br-subtle px-4 py-3 text-sm text-txt-secondary transition-colors hover:bg-error/10 hover:text-error"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  );
};
