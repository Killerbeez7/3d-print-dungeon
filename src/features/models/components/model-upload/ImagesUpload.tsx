import { FC, useState, useRef, ChangeEvent, useEffect } from "react";
import { ImagePlus } from "lucide-react";
import type { ModelUploadData } from "@/features/models/types/model";
import { PrimaryPreview } from "./PrimaryPreview";
import { RenderList } from "./RenderList";
import { ImageCropModal } from "./ImageCropModal";

const MAX_RENDERS = 16;

// Now storing original and cropped versions
interface RenderItem {
  id: string;
  originalFile: File;
  originalPreview: string;
  croppedFile: File;
  croppedPreview: string;
}

interface ImagesUploadProps {
  modelData: ModelUploadData;
  setModelData: React.Dispatch<React.SetStateAction<ModelUploadData>>;
}

export const ImagesUpload: FC<ImagesUploadProps> = ({ setModelData }) => {
  const [renders, setRenders] = useState<RenderItem[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const [isCropModalOpen, setCropModalOpen] = useState(false);
  const [croppingItem, setCroppingItem] = useState<RenderItem | null>(null);
  const [cropImageUrl, setCropImageUrl] = useState<string | null>(null);
  const [cropModalKey, setCropModalKey] = useState(0); // Force remount of modal

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const primaryRender = renders.find((r) => r.id === primaryId);
    const secondaryRenders = renders.filter((r) => r.id !== primaryId);
    const orderedRenders = primaryRender ? [primaryRender, ...secondaryRenders] : renders;

    setModelData((prev) => ({
      ...prev,
      renderFiles: orderedRenders.map((r) => r.croppedFile), // Always use the cropped file for upload
      renderPreviewUrls: orderedRenders.map((r) => r.croppedPreview),
    }));
  }, [renders, primaryId, setModelData]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newRender: RenderItem = {
      id: `render-${Date.now()}-${Math.random()}`,
      originalFile: file,
      originalPreview: URL.createObjectURL(file),
      croppedFile: file, // Initially, cropped is the same as original
      croppedPreview: URL.createObjectURL(file),
    };

    openCropForItem(newRender);
    e.target.value = "";
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (!croppingItem) return;

    const croppedFile = new File([croppedBlob], croppingItem.originalFile.name, {
      type: "image/jpeg",
    });
    const updatedRender: RenderItem = {
      ...croppingItem,
      croppedFile: croppedFile,
      croppedPreview: URL.createObjectURL(croppedBlob),
    };

    // Don't revoke originalPreview, we need it for re-cropping

    const existingIndex = renders.findIndex((r) => r.id === croppingItem.id);
    if (existingIndex > -1) {
      // Revoke the old *cropped* preview before updating
      URL.revokeObjectURL(renders[existingIndex].croppedPreview);
      const newRenders = [...renders];
      newRenders[existingIndex] = updatedRender;
      setRenders(newRenders);
    } else {
      setRenders((prev) => [...prev, updatedRender]);
      if (!primaryId) {
        // Set as primary if it's the first image
        setPrimaryId(updatedRender.id);
      }
    }

    setCropModalOpen(false);
    setCroppingItem(null);
  };

  const handleCropModalClose = () => {
    if (cropImageUrl) {
      URL.revokeObjectURL(cropImageUrl);
      setCropImageUrl(null);
    }
    // If it was a new image we also clean up its previews
    const isNew = !renders.some((r) => r.id === croppingItem?.id);
    if (croppingItem && isNew) {
      URL.revokeObjectURL(croppingItem.croppedPreview);
    }
    setCropModalOpen(false);
    setCroppingItem(null);
  };

  const handleRemove = (idToRemove: string) => {
    const indexToRemove = renders.findIndex((r) => r.id === idToRemove);
    if (indexToRemove === -1) return;

    // Clean up both blob URLs
    URL.revokeObjectURL(renders[indexToRemove].originalPreview);
    URL.revokeObjectURL(renders[indexToRemove].croppedPreview);

    const newRenders = renders.filter((_, i) => i !== indexToRemove);
    setRenders(newRenders);

    if (primaryId === idToRemove) {
      setPrimaryId(newRenders.length > 0 ? newRenders[0].id : null);
    }
  };

  const handleReorder = (sourceIndex: number, destIndex: number) => {
    const newRenders = [...renders];
    const [removed] = newRenders.splice(sourceIndex, 1);
    newRenders.splice(destIndex, 0, removed);
    setRenders(newRenders);
  };

  const handleRevert = (idToRevert: string) => {
    setRenders((prevRenders) =>
      prevRenders.map((r) => {
        if (r.id === idToRevert) {
          // Revoke the old cropped URL before replacing it
          URL.revokeObjectURL(r.croppedPreview);
          return {
            ...r,
            croppedFile: r.originalFile,
            croppedPreview: URL.createObjectURL(r.originalFile),
          };
        }
        return r;
      })
    );
  };

  const openCropForItem = (item: RenderItem) => {
    setCroppingItem(item);
    const freshUrl = URL.createObjectURL(item.originalFile);
    setCropImageUrl(freshUrl);
    setCropModalKey((prev) => prev + 1); // Force modal remount with fresh data
    setCropModalOpen(true);
  };

  const primaryRender = renders.find((r) => r.id === primaryId);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      renders.forEach((render) => {
        URL.revokeObjectURL(render.originalPreview);
        URL.revokeObjectURL(render.croppedPreview);
      });
    };
  }, []);

  return (
    <div className="space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        onChange={handleFileChange}
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-txt-primary">Images</h3>
          <p className="mt-0.5 text-sm text-txt-secondary">
            The cover leads your listing and the home gallery.
            {renders.length > 1 && " Click an image to make it the cover, drag to reorder."}
          </p>
        </div>
        {renders.length > 0 && (
          <span className="shrink-0 font-mono text-xs text-txt-muted">
            {renders.length}/{MAX_RENDERS}
          </span>
        )}
      </div>

      <PrimaryPreview
        previewUrl={primaryRender?.croppedPreview}
        onSelect={handleFileSelect}
        onRemove={() => primaryRender && handleRemove(primaryRender.id)}
        onCrop={() => primaryRender && openCropForItem(primaryRender)}
        onRevert={() => primaryRender && handleRevert(primaryRender.id)}
      />

      {renders.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <RenderList
              renders={renders.map((r) => ({ id: r.id, preview: r.croppedPreview }))}
              primaryId={primaryId}
              onRemove={handleRemove}
              onReorder={handleReorder}
              onSetPrimary={setPrimaryId}
            />
          </div>
          {renders.length < MAX_RENDERS && (
            <button
              type="button"
              onClick={handleFileSelect}
              aria-label="Add another image"
              className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-br-input text-txt-secondary transition-colors hover:border-accent hover:text-accent"
            >
              <ImagePlus className="size-5" aria-hidden="true" />
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
      )}

      {isCropModalOpen && croppingItem && (
        <ImageCropModal
          key={cropModalKey} // Force re-mount on each open to ensure fresh state
          isOpen={isCropModalOpen}
          imageUrl={cropImageUrl || croppingItem.originalPreview}
          onClose={handleCropModalClose}
          onComplete={handleCropComplete}
        />
      )}
    </div>
  );
};
