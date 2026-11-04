import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  CalendarDays,
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

import type { CreatorTotals } from "../hooks/useCreatorModels";
import type { PublicProfileView } from "../types/profile";

const socialIcons: Record<string, { icon: LucideIcon; label: string }> = {
  twitter: { icon: Twitter, label: "X / Twitter" },
  instagram: { icon: Instagram, label: "Instagram" },
  facebook: { icon: Facebook, label: "Facebook" },
  linkedin: { icon: Linkedin, label: "LinkedIn" },
  youtube: { icon: Youtube, label: "YouTube" },
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value === "object" && value !== null && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
};

interface ProfileCardProps {
  user: PublicProfileView;
  isOwner: boolean;
  /** Live totals from the creator's listings; null while they load. */
  totals: CreatorTotals | null;
}

/** Identity, actions and numbers. Sits beside the work on wide screens. */
export const ProfileCard = ({ user, isOwner, totals }: ProfileCardProps) => {
  const { open } = useModal("auth");
  const [copied, setCopied] = useState(false);
  const avatarUrl = useMemo(() => getAvatarUrlWithCacheBust(user.photoURL), [user.photoURL]);
  const joined = toDate(user.joinedAt);

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

  const stats: { label: string; value: string | null }[] = [
    { label: "Models", value: totals ? compact.format(totals.models) : null },
    { label: "Views", value: totals ? compact.format(totals.views) : null },
    { label: "Likes", value: totals ? compact.format(totals.likes) : null },
  ];
  const followers = user.stats?.followersCount ?? 0;
  const following = user.stats?.followingCount ?? 0;

  return (
    <section aria-label="Profile" className="relative">
      <span className="-mt-16 inline-block rounded-full bg-page p-2 sm:-mt-20">
        <img
          src={avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="avatar-token size-28 bg-muted object-cover sm:size-36"
          onError={(event) => {
            const image = event.currentTarget;
            if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) image.src = STATIC_ASSETS.DEFAULT_AVATAR;
          }}
        />
      </span>

      <h1 className="mt-3 flex items-center gap-2 break-words text-2xl font-bold leading-tight sm:text-3xl">
        <span className="min-w-0">{user.displayName}</span>
        {user.isVerified && <BadgeCheck className="size-6 shrink-0 text-accent" aria-label="Verified" />}
      </h1>
      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm">
        <span className="truncate font-mono text-txt-muted">@{user.username}</span>
        {user.isArtist && (
          <span className="label-mono rounded bg-accent-soft px-1.5 py-0.5 text-[0.65rem] text-accent">Creator</span>
        )}
      </p>

      {user.bio && (
        <p className="mt-4 line-clamp-4 whitespace-pre-line text-sm leading-relaxed text-txt-secondary">{user.bio}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        {isOwner ? (
          <>
            <Link to="/settings" className={buttonClassName({ variant: "secondary", className: "flex-1" })}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit profile
            </Link>
            <Link to="/model/upload" className={buttonClassName({ className: "flex-1" })}>
              <Upload className="size-4" aria-hidden="true" />
              Upload
            </Link>
          </>
        ) : (
          <>
            <div className="flex-1 [&>div]:items-stretch">
              <FollowButton
                targetUserId={user.uid}
                targetUserName={user.displayName}
                openAuthModal={() => open({ mode: "signin" })}
                className="w-full"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => void copyLink()}
              aria-label="Copy profile link"
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

      <dl className="mt-6 grid grid-cols-3 divide-x divide-br-subtle rounded-xl border border-br-subtle bg-surface-card">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-w-0 flex-col-reverse px-2 py-3 text-center">
            <dt className="label-mono mt-0.5 truncate text-[0.65rem] text-txt-muted">{stat.label}</dt>
            <dd className="font-mono text-lg font-semibold tabular-nums text-txt-primary">
              {stat.value ?? <span className="skeleton-line mx-auto block h-4 w-8" />}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-3 text-sm text-txt-secondary">
        <span className="font-semibold tabular-nums text-txt-primary">{compact.format(followers)}</span>{" "}
        {followers === 1 ? "follower" : "followers"}
        <span className="mx-2 text-txt-muted" aria-hidden="true">·</span>
        <span className="font-semibold tabular-nums text-txt-primary">{compact.format(following)}</span> following
      </p>

      <ul className="mt-5 space-y-2 text-sm text-txt-secondary">
        {user.location && (
          <li className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-txt-muted" aria-hidden="true" />
            {user.location}
          </li>
        )}
        {user.website && (
          <li>
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-colors hover:text-accent"
            >
              <Globe className="size-4 shrink-0 text-txt-muted" aria-hidden="true" />
              <span className="truncate">{hostname(user.website)}</span>
            </a>
          </li>
        )}
        {joined && (
          <li className="flex items-center gap-2">
            <CalendarDays className="size-4 shrink-0 text-txt-muted" aria-hidden="true" />
            Joined {joined.toLocaleDateString("en", { month: "long", year: "numeric" })}
          </li>
        )}
      </ul>

      {socialLinks.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1">
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
                  className="flex size-9 items-center justify-center rounded-lg border border-br-subtle text-txt-muted transition-colors hover:border-br-primary hover:text-txt-primary"
                >
                  <Icon className="size-4" aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
