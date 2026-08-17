import { FC, useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import FocusLock from "react-focus-lock";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faUndo } from "@fortawesome/free-solid-svg-icons";
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
    <div className="fixed inset-0 z-[11000] flex items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <FocusLock returnFocus>
        <div className="relative bg-section rounded-2xl shadow-xl border border-br-secondary w-[90vw] max-w-5xl h-[90vh] max-h-[90vh] mx-4 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-br-secondary">
            <h2 className="text-xl font-bold text-txt-primary">Adjust Image</h2>
            <button
              className="p-2 rounded-full hover:bg-surface-card transition-colors text-txt-secondary"
              onClick={onClose}
              aria-label="Close"
            >
              <FontAwesomeIcon icon={faXmark} />
            </button>
          </div>

          {/* Cropper */}
          <div className="relative flex-grow min-h-0 flex items-center justify-center bg-page overflow-hidden p-6">
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
          <div className="p-4 space-y-4 border-t border-br-secondary">
            {/* Aspect Ratio */}
            <div className="flex justify-center items-center gap-2">
              {aspectRatios.map(({ label, value }) => (
                <Button
                  key={label}
                  type="button"
                  size="sm"
                  variant={aspect === value ? "primary" : "secondary"}
                  onClick={() => setAspect(value)}
                  aria-pressed={aspect === value}
                  className="transition-transform duration-150 hover:scale-105"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center gap-3 p-4 bg-surface-card border-t border-br-secondary rounded-b-2xl">
            <Button onClick={handleReset}>
              <FontAwesomeIcon icon={faUndo} /> Reset
            </Button>
            <div className="flex gap-3">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={!croppedAreaPixels}
                leftIcon={<FontAwesomeIcon icon={faCheck} />}
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
