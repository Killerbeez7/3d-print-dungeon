import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrop, faImage, faUndo, faXmark } from "@fortawesome/free-solid-svg-icons";

interface PrimaryPreviewProps {
  previewUrl?: string;
  onSelect: () => void;
  onRemove: () => void;
  onCrop: () => void;
  onRevert: () => void;
}

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
        className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-br-primary transition-colors hover:border-accent hover:bg-accent-soft/40 hover:text-accent"
      >
        <FontAwesomeIcon icon={faImage} className="mb-3 text-4xl" />
        <span className="font-medium">Add Primary Render</span>
      </button>
    );
  }

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-lg bg-surface-card shadow-lg">
      <img
        src={previewUrl}
        alt="Primary render"
        className="h-full w-full object-contain"
      />

      <div className="absolute inset-0 flex items-center justify-center gap-4 bg-inverse/40 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onCrop}
          aria-label="Resize / Crop"
          className="inline-flex h-10 w-11 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--btn-main)_0%,var(--btn-secondary)_100%)] text-sm font-semibold text-txt-primary shadow transition-all duration-150 hover:-translate-y-0.5 hover:scale-110 hover:bg-[linear-gradient(135deg,var(--btn-secondary)_0%,var(--btn-hover)_100%)] hover:text-inverse hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faCrop} />
        </button>

        <button
          type="button"
          onClick={onRevert}
          aria-label="Revert to Original"
          className="inline-flex h-10 w-11 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--btn-main)_0%,var(--btn-secondary)_100%)] text-sm font-semibold text-txt-primary shadow transition-all duration-150 hover:-translate-y-0.5 hover:scale-110 hover:bg-[linear-gradient(135deg,var(--btn-secondary)_0%,var(--btn-hover)_100%)] hover:text-inverse hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faUndo} />
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove"
          className="inline-flex h-10 w-11 items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--contrast)_0%,var(--contrast-hover)_100%)] text-sm font-semibold text-txt-inverse shadow transition-all duration-150 hover:-translate-y-0.5 hover:scale-110 hover:bg-[linear-gradient(135deg,var(--contrast-hover)_0%,var(--contrast)_100%)] hover:shadow-xl"
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  );
}
