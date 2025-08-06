import { FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faCrop, faXmark, faUndo } from "@fortawesome/free-solid-svg-icons";

interface PrimaryPreviewProps {
    previewUrl?: string;
    onSelect: () => void;
    onRemove: () => void;
    onCrop: () => void;
    onRevert: () => void;
}

export const PrimaryPreview: FC<PrimaryPreviewProps> = ({
    previewUrl,
    onSelect,
    onRemove,
    onCrop,
    onRevert,
}) => {
    if (!previewUrl) {
        return (
            <div
                onClick={onSelect}
                className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-accent hover:text-accent transition-colors"
            >
                <FontAwesomeIcon icon={faImage} className="text-4xl mb-3" />
                <span className="font-medium">Add Primary Render</span>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 group">
            <img
                src={previewUrl}
                alt="Primary render"
                className="w-full h-full object-contain"
            />

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm transition-opacity flex items-center justify-center gap-4">
                <button
                    onClick={onCrop}
                    aria-label="Resize / Crop"
                    className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 shadow hover:bg-surface-hover hover:text-primary hover:shadow-xl hover:scale-110 transform transition-all duration-150"
                >
                    <FontAwesomeIcon icon={faCrop} />
                </button>
                <button
                    onClick={onRevert}
                    aria-label="Revert to Original"
                    className="p-3 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 shadow hover:bg-surface-hover hover:text-primary hover:shadow-xl hover:scale-110 transform transition-all duration-150"
                >
                    <FontAwesomeIcon icon={faUndo} />
                </button>
                <button
                    onClick={onRemove}
                    aria-label="Remove"
                    className="p-3 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:scale-110 transform transition-all duration-150"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
        </div>
    );
};
