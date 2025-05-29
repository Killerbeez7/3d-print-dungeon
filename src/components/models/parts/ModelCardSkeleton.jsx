export function ModelCardSkeleton() {
    return (
        <div className="relative bg-bg-surface rounded-md overflow-hidden animate-pulse w-full aspect-square flex flex-col">
            {/* Image placeholder */}
            <div className="bg-gray-300 h-2/3 w-full" />
            {/* Title bar placeholder */}
            <div className="bg-gray-400 h-6 w-3/4 mt-4 mx-auto rounded" />
            {/* Subtitle/avatar placeholder */}
            <div className="bg-gray-400 h-4 w-1/2 mt-2 mx-auto rounded" />
        </div>
    );
}
