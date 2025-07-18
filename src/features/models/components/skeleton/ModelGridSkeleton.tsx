import { ModelCardSkeleton } from "./ModelCardSkeleton";
import { PAGE_SIZE } from "@/features/models/services/modelsService";

export const ModelGridSkeleton = () => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <ModelCardSkeleton key={i} />
            ))}
        </div>
    );
};
