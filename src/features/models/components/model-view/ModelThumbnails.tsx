import { LazyImage } from "@/features/shared/reusable/LazyImage";
import { Model3DIcon } from "@/features/shared/Model3DIcon";
import { getThumbnailUrl } from "@/utils/imageUtils";

interface ModelThumbnailsProps {
    renderUrls: string[];
    selectedRenderIndex: number;
    setSelectedRenderIndex: (index: number) => void;
}

export const ModelThumbnails = ({
    renderUrls,
    selectedRenderIndex,
    setSelectedRenderIndex,
}: ModelThumbnailsProps) => {
    return (
        <div className="">
            <div className="flex space-x-4 overflow-x-auto pb-5 -mx-2 px-2">
                <div
                    onClick={() => setSelectedRenderIndex(-1)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 border-2 rounded-lg cursor-pointer overflow-hidden bg-bg-muted ${
                        selectedRenderIndex === -1
                            ? "border-accent shadow-lg ring-2 ring-accent/45"
                            : "border-br-secondary hover:border-accent hover:shadow-md"
                    }`}
                >
                    <div className="w-full h-full flex items-center justify-center">
                        <Model3DIcon
                            size={32}
                            className="text-txt-secondary"
                        />
                    </div>
                </div>

                {renderUrls.map((url, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedRenderIndex(idx)}
                        className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 border-2 rounded-lg cursor-pointer overflow-hidden bg-bg-muted ${
                            selectedRenderIndex === idx
                                ? "border-accent shadow-lg ring-2 ring-accent/45"
                                : "border-br-secondary hover:border-accent hover:shadow-md"
                        }`}
                    >
                        <LazyImage
                            wrapperClassName="w-full h-full"
                            src={getThumbnailUrl(url, "SMALL") || url}
                            alt={`Render ${idx + 1}`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
