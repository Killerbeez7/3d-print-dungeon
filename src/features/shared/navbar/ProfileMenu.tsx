import { useRef, type RefObject } from "react";
import { Link } from "react-router-dom";
import {
  CircleUserRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Settings,
  Upload,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import { ThemeToggle } from "@/features/shared/components/ThemeToggle";

interface ProfileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  displayName: string;
  username: string | null;
  email: string;
  avatarSrc: string | null;
  profilePath: string;
}

const Avatar = ({ src, className }: { src: string | null; className: string }) => {
  if (!src) {
    return (
      <span className={`flex items-center justify-center bg-muted text-txt-secondary ${className}`}>
        <CircleUserRound className="size-3/5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={`object-cover ${className}`}
      onError={(event) => {
        const image = event.currentTarget;
        if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
          image.src = STATIC_ASSETS.DEFAULT_AVATAR;
        }
      }}
    />
  );
};

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
  avatarSrc,
  profilePath,
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
        className={`chamfer flex size-10 items-center justify-center overflow-hidden transition-[filter,transform] duration-200 [--cut:7px] ${
          isOpen ? "brightness-110" : "hover:brightness-110"
        }`}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar src={avatarSrc} className="size-10" />
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-50 mt-3 w-80 max-w-[calc(100vw-1.5rem)] origin-top-right overflow-hidden rounded-xl border border-br-secondary bg-surface-elevated shadow-2xl shadow-black/40 transition-[opacity,transform,visibility] duration-200 ease-forge ${
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
          <span className="chamfer bg-surface-elevated p-1 [--cut:10px]">
            <Avatar src={avatarSrc} className="chamfer size-14 [--cut:8px]" />
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
                  featured ? "bg-btn-primary text-white" : "bg-muted text-txt-secondary group-hover:text-txt-primary"
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
