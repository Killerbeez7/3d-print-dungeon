import { useState } from "react";

import type { ModelData } from "@/features/models/types/model";
import { getThumbnailUrl } from "@/utils/imageUtils";

import { profileCoverBackground } from "../utils/profileCover";

const TILES = 8;

// Static class names so Tailwind keeps them; columns match the image count.
const SM_COLS: Record<number, string> = { 4: "sm:grid-cols-4", 5: "sm:grid-cols-5", 6: "sm:grid-cols-6" };
const LG_COLS: Record<number, string> = {
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
  7: "lg:grid-cols-7",
  8: "lg:grid-cols-8",
};

/**
 * Cover made from the creator's most viewed work, dimmed so the profile reads
 * on top: a mosaic with 4+ different images, one blurred image with fewer,
 * and the username in outline on the generated glow with none.
 */
export const ProfileCover = ({ seed, models }: { seed: string; models: ModelData[] }) => {
  const images = [...models]
    .filter((model) => model.renderPrimaryUrl)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .filter((model, index, list) => list.findIndex((other) => other.renderPrimaryUrl === model.renderPrimaryUrl) === index)
    .slice(0, TILES)
    .map((model) => model.renderPrimaryUrl as string);

  const count = images.length;

  return (
    <div className="relative h-44 overflow-hidden border-b border-br-subtle bg-section sm:h-60 lg:h-72" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: profileCoverBackground(seed) }} />

      {count >= 4 ? (
        <div
          className={`absolute inset-0 grid grid-cols-4 gap-px opacity-60 ${SM_COLS[Math.min(count, 6)]} ${LG_COLS[count]}`}
        >
          {images.map((url, index) => (
            <CoverImage
              key={url}
              url={url}
              // Phones show 4 tiles, tablets 6, desktops all.
              className={`size-full object-cover ${
                index >= 6 ? "hidden lg:block" : index >= 4 ? "hidden sm:block" : ""
              }`}
            />
          ))}
        </div>
      ) : count > 0 ? (
        <CoverImage
          url={images[0]}
          size="LARGE"
          className="absolute inset-0 size-full scale-110 object-cover opacity-55 blur-2xl"
        />
      ) : (
        <p className="pointer-events-none absolute -bottom-[0.18em] right-4 select-none truncate font-display text-[clamp(3rem,13vw,9rem)] font-bold uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_var(--br-primary)]">
          {seed}
        </p>
      )}

      <div className="bg-layer-lines absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-page/10 via-page/40 to-page" />
    </div>
  );
};

const CoverImage = ({
  url,
  className,
  size = "MEDIUM",
}: {
  url: string;
  className: string;
  size?: "MEDIUM" | "LARGE";
}) => {
  const [failed, setFailed] = useState(false);
  if (failed) return <span className={`bg-muted ${className}`} />;
  return (
    <img
      src={getThumbnailUrl(url, size) ?? url}
      alt=""
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
