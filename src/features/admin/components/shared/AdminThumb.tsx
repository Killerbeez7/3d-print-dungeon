import { useState } from "react";
import { Box } from "lucide-react";

import { getThumbnailUrl } from "@/utils/imageUtils";

/** Small listing image: the 200px thumbnail, falling back to the original. */
export const AdminThumb = ({ url, className = "size-10" }: { url?: string | null; className?: string }) => {
  const thumb = getThumbnailUrl(url ?? null, "SMALL");
  const [src, setSrc] = useState(thumb ?? url ?? null);

  return (
    <span className={`chamfer relative block shrink-0 overflow-hidden bg-muted [--cut:6px] ${className}`}>
      {src ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
          onError={() => setSrc(src !== url && url ? url : null)}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-txt-muted">
          <Box className="size-4" aria-hidden="true" />
        </span>
      )}
    </span>
  );
};
