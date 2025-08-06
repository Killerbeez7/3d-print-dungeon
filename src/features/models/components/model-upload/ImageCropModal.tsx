import { FC, useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Point, Area } from "react-easy-crop/types";
import FocusLock from "react-focus-lock";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faUndo } from "@fortawesome/free-solid-svg-icons";

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

export const ImageCropModal: FC<ImageCropModalProps> = ({ isOpen, imageUrl, aspect: initialAspect = 4 / 3, onClose, onComplete }) => {
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
                <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 w-[90vw] max-w-5xl h-[90vh] max-h-[90vh] mx-4 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Adjust Image</h2>
                        <button
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>

                    {/* Cropper */}
                    <div className="relative flex-grow min-h-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 overflow-hidden p-6">
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            rotation={rotation}
                            aspect={aspect}
                            objectFit="contain"
                            restrictPosition
                            style={{ containerStyle: { width: '100%', height: '100%' } }}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onRotationChange={setRotation}
                            onCropComplete={onCropComplete}
                        />
                    </div>

                    {/* Controls */}
                    <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Aspect Ratio */}
                        <div className="flex justify-center items-center gap-2">
                            {aspectRatios.map(({ label, value }) => (
                                <button
                                    key={label}
                                    onClick={() => setAspect(value)}
                                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                        aspect === value
                                            ? "bg-gradient-to-r from-accent to-purple-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transform transition-transform duration-150"
                                            : "bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 text-gray-700 dark:text-gray-300 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 shadow hover:shadow-lg hover:scale-105 transform transition-transform duration-150"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-between items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl">
                        <button
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 text-gray-800 dark:text-gray-200 hover:from-gray-300 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-600 flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transform transition-transform duration-150 transition-colors"
                            onClick={handleReset}
                        >
                            <FontAwesomeIcon icon={faUndo} /> Reset
                        </button>
                        <div className="flex gap-3">
                            <button
                                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700 shadow hover:shadow-lg hover:scale-105 transform transition-transform duration-150 transition-colors"
                                onClick={onClose}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-purple-500 hover:from-accent-hover hover:to-purple-600 text-white flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transform transition-transform duration-150 transition-colors disabled:opacity-50"
                                onClick={handleApply}
                                disabled={!croppedAreaPixels}
                            >
                                <FontAwesomeIcon icon={faCheck} /> Apply
                            </button>
                        </div>
                    </div>
                </div>
            </FocusLock>
        </div>,
        document.body
    );
};