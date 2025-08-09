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
                className="aspect-video flex flex-col items-center justify-center border-2 border-dashed border-br-primary rounded-lg cursor-pointer hover:border-accent hover:text-accent transition-colors"
            >
                <FontAwesomeIcon icon={faImage} className="text-4xl mb-3" />
                <span className="font-medium">Add Primary Render</span>
            </div>
        );
    }

    return (
        <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-lg bg-bg-surface group">
            <img
                src={previewUrl}
                alt="Primary render"
                className="w-full h-full object-contain"
            />

            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-bg-reverse/40 backdrop-blur-sm transition-opacity flex items-center justify-center gap-4">
                <button
                    onClick={onCrop}
                    aria-label="Resize / Crop"
                    className="secondary-button p-3 rounded-full shadow hover:shadow-xl hover:scale-110 transform transition-all duration-150"
                >
                    <FontAwesomeIcon icon={faCrop} />
                </button>
                <button
                    onClick={onRevert}
                    aria-label="Revert to Original"
                    className="secondary-button p-3 rounded-full shadow hover:shadow-xl hover:scale-110 transform transition-all duration-150"
                >
                    <FontAwesomeIcon icon={faUndo} />
                </button>
                <button
                    onClick={onRemove}
                    aria-label="Remove"
                    className="contrast-button p-3 rounded-full shadow hover:shadow-xl hover:scale-110 transform transition-all duration-150"
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
            </div>
        </div>
    );
};
