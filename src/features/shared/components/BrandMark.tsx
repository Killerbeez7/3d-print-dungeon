import {
  BADGE_PATH,
  BADGE_VIEWBOX,
  IRIS_PATH,
  LABEL_PATH,
  LETTERS_PATH,
  PUPIL_PATH,
  WORDMARK_RATIO,
  WORDMARK_VIEWBOX,
} from "./brandPaths";

// The logo: keep badge + "3D PRINT" + DUNGEON with a dragon-eye O.
// Both parts are inline SVGs of the same height, so the badge always spans the text block
// (top of "3D PRINT" to the baseline of DUNGEON) and the gap equals one letter stem.
// Colours come from theme tokens; the pupil stays dark in both themes.

interface BrandMarkProps {
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: "md" | "lg";
  className?: string;
}

const SIZES = {
  md: { height: "h-8", gap: "gap-1.5" },
  lg: { height: "h-10", gap: "gap-2" },
} as const;

export const BrandMark = ({
  showWordmark = true,
  wordmarkClassName = "",
  size = "md",
  className = "",
}: BrandMarkProps) => {
  const { height, gap } = SIZES[size];

  return (
    <span className={`flex items-center ${gap} ${className}`}>
      <svg
        viewBox={BADGE_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        className={`${height} w-auto shrink-0 fill-accent`}
        style={{ aspectRatio: "92 / 93.7" }}
      >
        <path fillRule="evenodd" d={BADGE_PATH} />
      </svg>
      {showWordmark && (
        <svg
          viewBox={WORDMARK_VIEWBOX}
          aria-hidden="true"
          focusable="false"
          className={`${height} w-auto shrink-0 ${wordmarkClassName}`}
          style={{ aspectRatio: WORDMARK_RATIO }}
        >
          <path d={LABEL_PATH} className="fill-txt-muted" />
          <path fillRule="evenodd" d={LETTERS_PATH} className="fill-txt-primary" />
          <path d={IRIS_PATH} className="fill-accent" />
          <path d={PUPIL_PATH} className="fill-page [[data-theme=light]_&]:fill-txt-primary" />
        </svg>
      )}
    </span>
  );
};
