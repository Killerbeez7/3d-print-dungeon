import { STATIC_ASSETS } from "@/config/assetsConfig";

// The layered keep, tinted with the accent colour. Small sizes use the compact
// drawing (fewer, thicker layer lines) so they stay visible at header size.
const maskFor = (url: string) => `url(${url}) center / contain no-repeat`;
const LOGO_MASK = maskFor(STATIC_ASSETS.LOGO);
const LOGO_COMPACT_MASK = maskFor(STATIC_ASSETS.LOGO_COMPACT);

interface BrandMarkProps {
  showWordmark?: boolean;
  wordmarkClassName?: string;
  size?: "md" | "lg";
  className?: string;
}

/** Logo tinted with the accent colour, plus the stacked wordmark. */
export const BrandMark = ({
  showWordmark = true,
  wordmarkClassName = "",
  size = "md",
  className = "",
}: BrandMarkProps) => {
  const isLarge = size === "lg";

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className={`shrink-0 bg-accent ${isLarge ? "size-12" : "size-9"}`}
        style={{
          mask: isLarge ? LOGO_MASK : LOGO_COMPACT_MASK,
          WebkitMask: isLarge ? LOGO_MASK : LOGO_COMPACT_MASK,
        }}
      />
      {showWordmark && (
        <span className={`flex flex-col leading-none ${wordmarkClassName}`}>
          <span
            className={`label-mono text-txt-muted ${isLarge ? "text-[0.7rem]" : "text-[0.6rem]"}`}
          >
            3D Print
          </span>
          <span
            className={`font-display font-bold uppercase tracking-tight text-txt-primary ${
              isLarge ? "text-xl" : "text-[0.95rem]"
            }`}
          >
            Dungeon
          </span>
        </span>
      )}
    </span>
  );
};
