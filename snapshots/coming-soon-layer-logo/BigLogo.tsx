import { useSyncExternalStore } from "react";

import { Die } from "@/features/shared/components/Die";
import {
  LABEL_PATH,
  LETTERS_PATH,
  WORDMARK_RATIO,
  WORDMARK_VIEWBOX,
} from "@/features/shared/components/brandPaths";

const WIDE = "(min-width: 640px)";

const subscribe = (onChange: () => void) => {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * The logo at hero size: the wordmark prints in layer by layer, then the die keeps turning now
 * and then (and rolls when pointed at). Without motion it simply appears.
 */
export const BigLogo = () => {
  const wide = useSyncExternalStore(subscribe, () => window.matchMedia(WIDE).matches, () => true);
  // Same proportions as BrandMark: the die is as tall as the text block (edge × 1.633).
  const edge = wide ? 64 : 34;
  const height = Math.round(edge * 1.633);

  return (
    <span
      role="img"
      aria-label="3D Print Dungeon"
      className="flex items-center gap-3 sm:gap-5"
    >
      <span className="logo-print logo-print--die">
        <Die edge={edge} mode="idle" rollOnHover />
      </span>
      <svg
        viewBox={WORDMARK_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        className="logo-print w-auto shrink-0"
        style={{ height, aspectRatio: WORDMARK_RATIO }}
      >
        <path d={LABEL_PATH} className="fill-txt-muted" />
        <path fillRule="evenodd" d={LETTERS_PATH} className="fill-txt-primary" />
      </svg>
    </span>
  );
};
