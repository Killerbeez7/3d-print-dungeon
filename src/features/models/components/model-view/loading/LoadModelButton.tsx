import { Box } from "lucide-react";

import { buttonClassName } from "@/components";

interface LoadModelButtonProps {
  handleLoadModel: () => void;
}

export const LoadModelButton = ({ handleLoadModel }: LoadModelButtonProps) => {
  return (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleLoadModel}
          className={buttonClassName({ size: "lg", className: "group" })}
        >
          <Box className="size-5 transition-transform duration-300 group-hover:rotate-12" aria-hidden="true" />
          Load 3D model
        </button>
        <p className="label-mono text-white/70">Drag to orbit · scroll to zoom</p>
      </div>
    </>
  );
};
