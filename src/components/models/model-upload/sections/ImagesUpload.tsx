import { TiDelete } from "react-icons/ti";
import type { FC, ChangeEvent } from "react";
import type { ModelData } from "@/types/model";

/**
 * Props for ImagesUpload component
 */
interface ImagesUploadProps {
    modelData: ModelData;
    setModelData: React.Dispatch<React.SetStateAction<ModelData>>;
}

/**
 * Image upload section for model upload flow.
 */
export const ImagesUpload: FC<ImagesUploadProps> = ({ modelData, setModelData }) => {
    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: string): void => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setModelData((prev) => {
            let updatedFiles = [...(prev.renderFiles as File[])];
            let updatedPreviews = [...(prev.renderPreviewUrls as string[])];
            if (type === "cover4_3") {
                updatedFiles[0] = files[0];
                updatedPreviews[0] = URL.createObjectURL(files[0]);
            } else if (type === "cover3_4") {
                updatedFiles[1] = files[0];
                updatedPreviews[1] = URL.createObjectURL(files[0]);
            } else {
                files.forEach((file) => {
                    if (file.type.startsWith("image/")) {
                        updatedFiles.push(file);
                        updatedPreviews.push(URL.createObjectURL(file));
                    }
                });
            }
            return {
                ...prev,
                renderFiles: updatedFiles,
                renderPreviewUrls: updatedPreviews,
            };
        });
    };
    const handleRemoveImage = (index: number): void => {
        setModelData((prev) => ({
            ...prev,
            renderFiles: (prev.renderFiles as File[]).filter((_, i) => i !== index),
            renderPreviewUrls: (prev.renderPreviewUrls as string[]).filter(
                (_, i) => i !== index
            ),
        }));
    };
    return (
        <div className="border rounded p-4 mb-2">
            <h4 className="font-semibold mb-2">Model Covers</h4>
            <p className="text-sm text-gray-400">
                jpg/gif/png, ≤ 30MB. Please use{" "}
                <span className="text-primary">real print photos</span>
            </p>
            <div className="flex gap-4 mt-3 bg-bg-surface">
                {/* 4:3 Cover */}
                <ImageUploadBox
                    label="Desktop cover 4:3"
                    image={modelData.renderPreviewUrls[0]}
                    onUpload={(e) => handleImageUpload(e, "cover4_3")}
                    onRemove={() => handleRemoveImage(0)}
                    id="cover4_3"
                    aspectRatio="4/3"
                />
                {/* 3:4 Cover */}
                <ImageUploadBox
                    label="Mobile cover 3:4"
                    image={modelData.renderPreviewUrls[1]}
                    onUpload={(e) => handleImageUpload(e, "cover3_4")}
                    onRemove={() => handleRemoveImage(1)}
                    id="cover3_4"
                    aspectRatio="3/4"
                />
            </div>
            {/* Additional Model Images */}
            <h4 className="font-semibold mt-4 mb-2">
                Model Pictures ({modelData.renderPreviewUrls.length} / 16)
            </h4>
            <p className="text-sm text-gray-400">
                Photos of the printed model, png/jpg/webp/gif, ≤ 30MB/piece, 4:3 ratio
                recommended
            </p>
            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden "
                id="modelImages"
                onChange={(e) => handleImageUpload(e, "additional")}
            />
            <label
                htmlFor="modelImages"
                className=" bg-bg-surface mt-2 border-dashed border-2 rounded-md w-full h-20 flex items-center justify-center text-primary cursor-pointer"
            >
                + Add Photo
            </label>
            <div className="flex flex-wrap gap-2 mt-3">
                {modelData.renderPreviewUrls.slice(2).map((url, index) => (
                    <ImagePreview
                        key={index + 2}
                        url={url}
                        onRemove={() => handleRemoveImage(index + 2)}
                    />
                ))}
            </div>
        </div>
    );
};

/**
 * Props for ImageUploadBox component
 */
interface ImageUploadBoxProps {
    label: string;
    image?: string;
    onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    id: string;
    aspectRatio: string;
}

/**
 * Upload box for a single image.
 */
const ImageUploadBox: FC<ImageUploadBoxProps> = ({
    label,
    image,
    onUpload,
    onRemove,
    id,
    aspectRatio,
}) => {
    return (
        <div className="flex flex-col items-center border rounded p-2 h-full w-[150px]">
            <label className="mb-2 text-sm font-medium">{label}</label>
            <input
                type="file"
                accept="image/*"
                className="hidden"
                id={id}
                onChange={onUpload}
            />
            <div
                className={`relative border-dashed border-2 flex items-center justify-center cursor-pointer rounded-md`}
                style={{ aspectRatio, width: "100%" }}
                onClick={() => document.getElementById(id)?.click()}
            >
                {image ? (
                    <>
                        <img
                            src={image}
                            alt={label}
                            className="w-full h-auto object-cover rounded-md"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                            className="absolute top-1 right-1 bg-error text-white rounded-full p-1"
                        >
                            <TiDelete size={18} />
                        </button>
                    </>
                ) : (
                    <span className="text-primary text-lg">+</span>
                )}
            </div>
        </div>
    );
};

/**
 * Props for ImagePreview component
 */
interface ImagePreviewProps {
    url: string;
    onRemove: () => void;
}

/**
 * Preview for an uploaded image.
 */
const ImagePreview: FC<ImagePreviewProps> = ({ url, onRemove }) => {
    return (
        <div className="relative w-24 h-24">
            <img
                src={url}
                alt="Model Preview"
                className="w-full h-full object-cover rounded-md"
            />
            <button
                type="button"
                onClick={onRemove}
                className="absolute top-1 right-1 bg-error text-white rounded-full p-1"
            >
                <TiDelete size={18} />
            </button>
        </div>
    );
};
