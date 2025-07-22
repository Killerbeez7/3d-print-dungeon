import { ModelData } from "@/features/models/types/model";
import { ProgressiveImage } from "@/features/shared/reusable/ProgressiveImage";
import { getThumbnailUrl } from "@/utils/imageUtils";
import { STATIC_ASSETS } from "@/config/assetsConfig";
import React from "react";

interface ModelCardProps {
    model: ModelData;
    style?: React.CSSProperties;
}

export const ModelCard = ({ model, style }: ModelCardProps) => {
    const thumbUrl =
        getThumbnailUrl(model.renderPrimaryUrl ?? null, "MEDIUM") ||
        STATIC_ASSETS.PLACEHOLDER_IMAGE;
    return (
        <div className="border rounded-lg overflow-hidden" style={style}>
            <ProgressiveImage
                src={thumbUrl}
                alt={model.name}
                className="w-full h-48 object-cover"
            />
        </div>
    );
};
