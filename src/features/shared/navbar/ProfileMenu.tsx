import { useRef, type RefObject } from "react";
import { Link } from "react-router-dom";
import { CircleUserRound, LayoutDashboard, LifeBuoy, LogOut, Settings, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useClickOutside } from "@/hooks/useClickOutside";
import { STATIC_ASSETS } from "@/config/assetsConfig";

interface ProfileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  displayName: string;
  email: string;
  avatarSrc: string | null;
  profilePath: string;
}

const itemClass =
  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-focus";

const Avatar = ({ src, name, size }: { src: string | null; name: string; size: string }) => {
  if (!src) {
    return <CircleUserRound className={`${size} text-txt-secondary`} aria-hidden="true" />;
  }

  return (
    <img
      src={src}
      alt=""
      referrerPolicy="no-referrer"
      className={`${size} rounded-full object-cover`}
      title={name}
      onError={(event) => {
        const image = event.currentTarget;
        if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
          image.src = STATIC_ASSETS.DEFAULT_AVATAR;
        }
      }}
    />
  );
};

export const ProfileMenu = ({
  isOpen,
  onToggle,
  onClose,
  onLogout,
  isAdmin,
  displayName,
  email,
  avatarSrc,
  profilePath,
}: ProfileMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useClickOutside(menuRef as RefObject<HTMLElement>, () => {
    if (isOpen) onClose();
  });

  const links: { to: string; label: string; icon: LucideIcon; show: boolean }[] = [
    { to: "/admin-dashboard", label: "Admin dashboard", icon: LayoutDashboard, show: isAdmin },
    { to: profilePath, label: "Your profile", icon: User, show: true },
    { to: "/settings", label: "Account settings", icon: Settings, show: true },
    { to: "/forum/help", label: "Help center", icon: LifeBuoy, show: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        id="profile-button"
        type="button"
        onClick={onToggle}
        className={`flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus ${
          isOpen ? "bg-muted" : "hover:bg-muted"
        }`}
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar src={avatarSrc} name={displayName} size="size-8" />
      </button>

      <div
        role="menu"
        className={`absolute right-0 top-full z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-xl border border-br-subtle bg-surface-elevated shadow-xl transition-[opacity,transform] duration-150 ease-out ${
          isOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
        }`}
      >
        <div className="p-2">
          <div className="flex items-center gap-3 px-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              <Avatar src={avatarSrc} name={displayName} size="size-10" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-txt-primary">{displayName}</p>
              {email && <p className="mt-0.5 truncate text-xs text-txt-muted">{email}</p>}
            </div>
          </div>

          <div className="my-1.5 border-t border-br-subtle" />

          {links
            .filter((link) => link.show)
            .map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} role="menuitem" className={itemClass} onClick={onClose}>
                <Icon className="size-4 text-txt-muted" aria-hidden="true" />
                <span>{label}</span>
              </Link>
            ))}

          <div className="my-1.5 border-t border-br-subtle" />

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className={`${itemClass} w-full hover:bg-error/10 hover:text-error`}
          >
            <LogOut className="size-4 text-txt-muted" aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
