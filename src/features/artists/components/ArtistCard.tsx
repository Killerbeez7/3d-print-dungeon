import { Link } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

import { STATIC_ASSETS } from "@/config/assetsConfig";
import { profileCoverBackground } from "@/features/user/profile/utils/profileCover";
import { getAvatarUrlWithCacheBust } from "@/utils/avatarUtils";
import { toUrlSafeUsername } from "@/utils/stringUtils";
import type { ArtistCardProps } from "../types/artists";

const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function ArtistCard({
  displayName,
  username,
  photoURL,
  bio,
  isVerified,
  stats,
}: ArtistCardProps) {
  const name = displayName || username || "Unnamed artist";
  const urlSafeUsername = toUrlSafeUsername(username);

  return (
    <Link
      to={`/${urlSafeUsername}`}
      className="reveal-up group flex h-full flex-col overflow-hidden rounded-xl border border-br-subtle bg-surface-card transition-[border-color,transform] duration-300 ease-forge hover:-translate-y-1 hover:border-br-primary"
    >
      {/* Generated cover, unique per username */}
      <div
        className="relative h-24 overflow-hidden bg-section"
        aria-hidden="true"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-forge group-hover:scale-125"
          style={{ background: profileCoverBackground(username || name) }}
        />
        <div className="bg-layer-lines absolute inset-0" />
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4">
        <span className="chamfer -mt-9 w-fit bg-surface-card p-1 [--cut:13px]">
          <img
            src={getAvatarUrlWithCacheBust(photoURL)}
            alt=""
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="chamfer size-16 bg-muted object-cover [--cut:11px]"
            onError={(event) => {
              const image = event.currentTarget;
              if (!image.src.endsWith(STATIC_ASSETS.DEFAULT_AVATAR)) {
                image.src = STATIC_ASSETS.DEFAULT_AVATAR;
              }
            }}
          />
        </span>

        <div className="flex-1">
          <h2 className="mt-3 flex min-w-0 items-center gap-1.5 font-sans text-base font-semibold text-txt-primary">
            <span
              className="truncate transition-colors group-hover:text-accent"
              title={name}
            >
              {name}
            </span>
            {isVerified && (
              <BadgeCheck
                className="size-4 shrink-0 text-accent"
                aria-label="Verified"
              />
            )}
          </h2>
          {username && (
            <p className="truncate font-mono text-xs text-txt-muted">
              @{username}
            </p>
          )}

          {bio && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-txt-secondary">
              {bio}
            </p>
          )}
        </div>

        {stats && (
          <dl className="mt-4 flex gap-5 border-t border-br-subtle pt-3 font-mono text-xs">
            <div className="flex gap-1.5">
              <dt className="text-txt-muted">Models</dt>
              <dd className="font-semibold text-txt-primary">
                {compact.format(stats.uploadsCount ?? 0)}
              </dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-txt-muted">Followers</dt>
              <dd className="font-semibold text-txt-primary">
                {compact.format(stats.followersCount ?? 0)}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </Link>
  );
}
