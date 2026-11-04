import { useState } from "react";
import { CircleUserRound } from "lucide-react";

import { STATIC_ASSETS } from "@/config/assetsConfig";

interface UserAvatarProps {
  /**
   * Photo addresses to try in order, e.g. the public profile photo, then the one from the
   * sign-in provider. A saved address can stop working (Google photo links change), so the
   * next one is tried before falling back to the default picture.
   */
  sources: ReadonlyArray<string | null | undefined>;
  /** Size and rim, e.g. "size-9" or "size-32 [--rim:2.5px] [--rim-gap:3px]". */
  className?: string;
  alt?: string;
}

/** A profile picture as a round token with a rim, like a miniature's base. */
export const UserAvatar = ({ sources, className = "", alt = "" }: UserAvatarProps) => {
  const urls = [...new Set(sources.filter((url): url is string => Boolean(url?.trim())))];
  // Remembers which list it counted failures for, so a new list starts from the first address.
  const [failed, setFailed] = useState({ key: "", count: 0 });
  const key = urls.join(" ");
  const count = failed.key === key ? failed.count : 0;

  if (urls.length === 0) {
    return (
      <span
        className={`avatar-token flex items-center justify-center bg-muted text-txt-secondary ${className}`}
      >
        <CircleUserRound className="size-3/5" aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={urls[count] ?? STATIC_ASSETS.DEFAULT_AVATAR}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`avatar-token bg-muted object-cover ${className}`}
      onError={() => {
        if (count < urls.length) setFailed({ key, count: count + 1 });
      }}
    />
  );
};
