import { Die } from "./Die";
import { LABEL_PATH, LETTERS_PATH, WORDMARK_RATIO, WORDMARK_VIEWBOX } from "./brandPaths";

// The logo: the die + "3D PRINT" + DUNGEON.
// The die is as tall as the text block (top of "3D PRINT" to the baseline of DUNGEON) and the
// gap equals one letter stem. Colours come from theme tokens.

interface BrandMarkProps {
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: "md" | "lg";
  /** Let the die roll on its own now and then (header only). */
  animated?: boolean;
  className?: string;
}

// edge = text block height / 1.633 (the height of a cube seen at the isometric angle)
const SIZES = {
  md: { height: "h-8", gap: "gap-1.5", edge: 20 },
  lg: { height: "h-10", gap: "gap-2", edge: 24 },
} as const;

export const BrandMark = ({
  showWordmark = true,
  wordmarkClassName = "",
  size = "md",
  animated = false,
  className = "",
}: BrandMarkProps) => {
  const { height, gap, edge } = SIZES[size];

  return (
    <span className={`flex items-center ${gap} ${className}`}>
      <Die edge={edge} mode={animated ? "idle" : "still"} rollOnHover />
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
        </svg>
      )}
    </span>
  );
};
