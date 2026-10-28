import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Check,
  Facebook,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  MapPin,
  Pencil,
  Twitter,
  Upload,
  Youtube,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button, buttonClassName } from "@/components";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import { FollowButton } from "@/features/user/follow/components/FollowButton";
import { useModal } from "@/features/shared/modal/hooks/useModal";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";

import type { PublicProfileView } from "../types/profile";
import { profileCoverBackground } from "../utils/profileCover";

const socialIcons: Record<string, { icon: LucideIcon; label: string }> = {
  twitter: { icon: Twitter, label: "X / Twitter" },
  instagram: { icon: Instagram, label: "Instagram" },
  facebook: { icon: Facebook, label: "Facebook" },
  linkedin: { icon: Linkedin, label: "LinkedIn" },
  youtube: { icon: Youtube, label: "YouTube" },
};

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

interface ProfileHeroProps {
  user: PublicProfileView;
  isOwner: boolean;
}

export const ProfileHero = ({ user, isOwner }: ProfileHeroProps) => {
  const { open } = useModal("auth");
  const [copied, setCopied] = useState(false);

  // Cache-busted URLs change every call; compute once per photo.
  const avatarUrl = useMemo(() => getAvatarUrlWithCacheBust(user.photoURL), [user.photoURL]);

  const socialLinks = Object.entries(user.socialLinks ?? {}).filter(
    (entry): entry is [string, string] => Boolean(entry[1]) && entry[0] in socialIcons
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing to do.
    }
  };

  return (
    <section>
      {/* Generated cover: brand glows placed by the username, layer lines on top. */}
      <div className="relative h-40 overflow-hidden border-b border-br-subtle bg-section sm:h-56">
        <div
          className="absolute inset-0"
          style={{ background: profileCoverBackground(user.username) }}
          aria-hidden="true"
        />
        <div className="bg-buildplate absolute inset-0 opacity-40" aria-hidden="true" />
        <div className="bg-layer-lines absolute inset-0" aria-hidden="true" />
        <p
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-[0.18em] right-4 select-none truncate font-display text-[clamp(3rem,13vw,9rem)] font-bold uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--br-primary)]"
        >
          {user.username}
        </p>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-4">
            <span className="chamfer shrink-0 bg-page p-1.5 [--cut:20px]">
              <img
                src={avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                className="chamfer size-28 bg-muted object-cover [--cut:16px] sm:size-32"
                onError={(event) => {
                  const image = event.currentTarget;
                  if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
                    image.src = STATIC_ASSETS.DEFAULT_AVATAR;
                  }
                }}
              />
            </span>
            <div className="min-w-0 pb-1">
              <h1 className="flex items-center gap-2 break-words text-2xl font-bold leading-tight sm:text-4xl">
                <span className="min-w-0">{user.displayName}</span>
                {user.isVerified && (
                  <BadgeCheck className="size-6 shrink-0 text-accent" aria-label="Verified" />
                )}
              </h1>
              <p className="mt-1 truncate font-mono text-sm text-txt-muted">@{user.username}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {isOwner ? (
              <>
                <Link to="/settings" className={buttonClassName({ variant: "secondary" })}>
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit profile
                </Link>
                <Link to="/model/upload" className={buttonClassName()}>
                  <Upload className="size-4" aria-hidden="true" />
                  Upload
                </Link>
              </>
            ) : (
              <>
                <FollowButton
                  targetUserId={user.uid}
                  targetUserName={user.displayName}
                  openAuthModal={() => open({ mode: "signin" })}
                />
                <Button
                  variant="secondary"
                  onClick={() => void copyLink()}
                  leftIcon={
                    copied ? (
                      <Check className="size-4 text-success" aria-hidden="true" />
                    ) : (
                      <Link2 className="size-4" aria-hidden="true" />
                    )
                  }
                >
                  {copied ? "Copied" : "Share"}
                </Button>
              </>
            )}
          </div>
        </div>

        {user.bio && (
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-txt-secondary">{user.bio}</p>
        )}

        {(user.location || user.website || socialLinks.length > 0) && (
          <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-txt-secondary">
            {user.location && (
              <li className="flex items-center gap-1.5">
                <MapPin className="size-4 text-txt-muted" aria-hidden="true" />
                {user.location}
              </li>
            )}
            {user.website && (
              <li>
                <a
                  href={user.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors hover:text-accent"
                >
                  <Globe className="size-4 text-txt-muted" aria-hidden="true" />
                  {hostname(user.website)}
                </a>
              </li>
            )}
            {socialLinks.map(([key, url]) => {
              const { icon: Icon, label } = socialIcons[key];
              return (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex size-8 items-center justify-center rounded-md text-txt-muted transition-colors hover:bg-muted hover:text-txt-primary"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};
