import { Crop, ImagePlus, Undo2, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PrimaryPreviewProps {
  previewUrl?: string;
  onSelect: () => void;
  onRemove: () => void;
  onCrop: () => void;
  onRevert: () => void;
}

interface ToolButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  danger?: boolean;
}

const ToolButton = ({ icon: Icon, label, onClick, danger }: ToolButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className={`chamfer flex size-10 items-center justify-center bg-surface-elevated/90 text-txt-primary backdrop-blur [--cut:8px] transition-colors ${
      danger ? "hover:bg-error/15 hover:text-error" : "hover:bg-btn-primary hover:text-btn-primary-text"
    }`}
  >
    <Icon className="size-4" aria-hidden="true" />
  </button>
);

export function PrimaryPreview({
  previewUrl,
  onSelect,
  onRemove,
  onCrop,
  onRevert,
}: PrimaryPreviewProps) {
  if (!previewUrl) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className="bg-buildplate group flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-br-input bg-page px-6 text-center transition-colors hover:border-accent"
      >
        <span className="chamfer flex size-14 items-center justify-center bg-btn-primary text-btn-primary-text [--cut:10px] transition-transform duration-300 group-hover:-translate-y-1">
          <ImagePlus className="size-6" aria-hidden="true" />
        </span>
        <span className="font-display text-lg font-semibold text-txt-primary">Add a cover image</span>
        <span className="font-mono text-[0.7rem] text-txt-muted">PNG  JPG  WEBP</span>
      </button>
    );
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-br-subtle bg-surface-card">
      <img src={previewUrl} alt="Cover image" className="size-full object-contain" />

      <span className="label-mono absolute left-3 top-3 bg-page/80 px-2 py-1 text-txt-secondary backdrop-blur">
        Cover
      </span>

      {/* Tools stay visible on touch screens, appear on hover or focus elsewhere */}
      <div className="absolute right-3 top-3 flex gap-1.5 transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:opacity-100">
        <ToolButton icon={Crop} label="Crop image" onClick={onCrop} />
        <ToolButton icon={Undo2} label="Revert to original" onClick={onRevert} />
        <ToolButton icon={X} label="Remove image" onClick={onRemove} danger />
      </div>
    </div>
  );
}
