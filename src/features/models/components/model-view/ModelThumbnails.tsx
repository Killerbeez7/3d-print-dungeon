import { Box } from "lucide-react";

import { LazyImage } from "@/features/shared/reusable/LazyImage";
import { getThumbnailUrl } from "@/utils/imageUtils";

interface ModelThumbnailsProps {
  renderUrls: string[];
  selectedRenderIndex: number;
  setSelectedRenderIndex: (index: number) => void;
}

const thumbClass = (isActive: boolean) =>
  `chamfer relative size-16 shrink-0 overflow-hidden bg-muted transition-[opacity,box-shadow] [--cut:8px] lg:size-20 ${
    isActive
      ? "opacity-100 ring-2 ring-inset ring-accent"
      : "opacity-60 hover:opacity-100"
  }`;

export const ModelThumbnails = ({
  renderUrls,
  selectedRenderIndex,
  setSelectedRenderIndex,
}: ModelThumbnailsProps) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Model views">
      <button
        type="button"
        onClick={() => setSelectedRenderIndex(-1)}
        className={thumbClass(selectedRenderIndex === -1)}
        aria-label="3D view"
        aria-pressed={selectedRenderIndex === -1}
      >
        <span className="bg-buildplate flex size-full flex-col items-center justify-center gap-1 text-txt-secondary">
          <Box className="size-6" aria-hidden="true" />
          <span className="label-mono text-[0.6rem]">3D</span>
        </span>
      </button>

      {renderUrls.map((url, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => setSelectedRenderIndex(idx)}
          className={thumbClass(selectedRenderIndex === idx)}
          aria-label={`Image ${idx + 1}`}
          aria-pressed={selectedRenderIndex === idx}
        >
          <LazyImage
            wrapperClassName="size-full"
            src={getThumbnailUrl(url, "SMALL") || url}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        </button>
      ))}
    </div>
  );
};
