import { FC, useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import FocusLock from "react-focus-lock";
import { createPortal } from "react-dom";
import { Check, RotateCcw, X } from "lucide-react";
import { Button } from "@/components";
import { getCroppedImg } from "./cropUtils";

export interface ImageCropModalProps {
  isOpen: boolean;
  imageUrl: string;
  aspect?: number;
  onClose: () => void;
  onComplete: (blob: Blob) => void;
}

const aspectRatios = [
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
  { label: "1:1", value: 1 },
  { label: "Free", value: undefined },
];

export const ImageCropModal: FC<ImageCropModalProps> = ({
  isOpen,
  imageUrl,
  aspect: initialAspect = 4 / 3,
  onClose,
  onComplete,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Reset modal state whenever it is reopened
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setAspect(initialAspect);
      setCroppedAreaPixels(null);
    }
  }, [isOpen, initialAspect]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = useCallback(async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
      onComplete(blob);
      onClose();
    } catch (err) {
      console.error(err);
    }
  }, [croppedAreaPixels, imageUrl, onClose, onComplete]);

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setAspect(initialAspect);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[11000] flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 animate-[fade_0.2s_ease] bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
      />
      <FocusLock returnFocus className="contents">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="crop-title"
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          className="auth-panel relative flex h-[92dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-br-secondary bg-surface-card shadow-2xl md:h-[88dvh] md:rounded-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 border-b border-br-subtle px-5 py-3">
            <div>
              <p className="label-mono text-txt-muted">Cover image</p>
              <h2 id="crop-title" className="text-lg font-bold text-txt-primary">
                Crop and frame
              </h2>
            </div>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-md text-txt-secondary transition-colors hover:bg-muted hover:text-txt-primary"
              onClick={onClose}
              aria-label="Close"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          {/* Cropper */}
          <div className="bg-buildplate relative min-h-0 flex-grow bg-page">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              objectFit="contain"
              restrictPosition
              style={{ containerStyle: { width: "100%", height: "100%" } }}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
            />
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4 border-t border-br-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div role="group" aria-label="Aspect ratio" className="flex flex-wrap items-center gap-1.5">
              <span className="label-mono mr-1 text-txt-muted">Ratio</span>
              {aspectRatios.map(({ label, value }) => (
                <Button
                  key={label}
                  type="button"
                  size="sm"
                  variant={aspect === value ? "primary" : "ghost"}
                  onClick={() => setAspect(value)}
                  aria-pressed={aspect === value}
                  className="font-mono [--cut:6px]"
                >
                  {label}
                </Button>
              ))}
            </div>

            <label className="flex items-center gap-3 sm:w-56">
              <span className="label-mono text-txt-muted">Zoom</span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="h-1 flex-1 cursor-pointer accent-btn-primary"
              />
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 border-t border-br-subtle bg-section px-5 py-3">
            <Button
              variant="ghost"
              onClick={handleReset}
              leftIcon={<RotateCcw className="size-4" aria-hidden="true" />}
            >
              Reset
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!croppedAreaPixels}
                leftIcon={<Check className="size-4" aria-hidden="true" />}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </FocusLock>
    </div>,
    document.body
  );
};
