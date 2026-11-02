import { useState } from "react";

import type { ModelData } from "@/features/models/types/model";
import { getThumbnailUrl } from "@/utils/imageUtils";

import { profileCoverBackground } from "../utils/profileCover";

const TILES = 8;

/**
 * Cover made from the creator's most viewed work, dimmed so the profile
 * reads on top. Falls back to the generated glow cover.
 */
export const ProfileCover = ({ seed, models }: { seed: string; models: ModelData[] }) => {
  const images = [...models]
    .filter((model) => model.renderPrimaryUrl)
    .sort((a, b) => (b.views ?? 0) - (a.views ?? 0))
    .filter((model, index, list) => list.findIndex((other) => other.renderPrimaryUrl === model.renderPrimaryUrl) === index)
    .slice(0, TILES);

  return (
    <div className="relative h-44 overflow-hidden border-b border-br-subtle bg-section sm:h-60 lg:h-72" aria-hidden="true">
      <div className="absolute inset-0" style={{ background: profileCoverBackground(seed) }} />
      {images.length >= 3 && (
        <div className="absolute inset-0 grid grid-cols-4 gap-px opacity-60 sm:grid-cols-6 lg:grid-cols-8">
          {images.map((model, index) => (
            <CoverTile key={model.id} url={model.renderPrimaryUrl as string} hideOnPhone={index >= 4} />
          ))}
        </div>
      )}
      <div className="bg-layer-lines absolute inset-0" />
      <div className="absolute inset-0 bg-gradient-to-b from-page/10 via-page/40 to-page" />
    </div>
  );
};

const CoverTile = ({ url, hideOnPhone }: { url: string; hideOnPhone: boolean }) => {
  const [failed, setFailed] = useState(false);
  const src = getThumbnailUrl(url, "MEDIUM") ?? url;
  if (failed) return <span className={`bg-muted ${hideOnPhone ? "hidden sm:block" : ""}`} />;
  return (
    <img
      src={src}
      alt=""
      decoding="async"
      onError={() => setFailed(true)}
      className={`size-full object-cover ${hideOnPhone ? "hidden sm:block" : ""}`}
    />
  );
};
