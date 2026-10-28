import { STATIC_ASSETS } from "@/config/assetsConfig";

const logoMask = `url(${STATIC_ASSETS.LOGO}) center / contain no-repeat`;

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
        style={{ mask: logoMask, WebkitMask: logoMask }}
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
