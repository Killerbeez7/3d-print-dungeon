export interface ModelCardSkeletonProps {
    // Zero-based index used to calculate animation delay for sequential fade-in.
    index?: number;
}

export function ModelCardSkeleton({ index = 0 }: ModelCardSkeletonProps) {
    const delayMs = index * 15; // 15 ms stagger per card (twice as fast)

    return (
        <div
            className="relative bg-bg-secondary rounded-md overflow-hidden animate-pulse w-full aspect-square flex items-center justify-center"
            style={{
                opacity: 0,
                animation: "fadeIn 0.25s ease-out forwards",
                animationDelay: `${delayMs}ms`,
            }}
        >
            <img
                src="/assets/images/logo.png"
                alt="3D Print Dungeon Logo"
                className="h-1/2 w-1/2 object-contain filter grayscale brightness-50"
            />
        </div>
    );
}
