export const ModelPageSkeleton = () => {
    return (
        <div className="text-txt-primary flex flex-col lg:flex-row gap-4 p-4 lg:p-6 animate-pulse">
            {/* Viewer Skeleton */}
            <div className="flex-1 w-full h-[40vh] lg:h-[calc(80vh-120px)] bg-bg-surface rounded-lg"></div>

            {/* Sidebar Skeleton */}
            <aside className="lg:w-96 w-full p-6 bg-bg-surface shadow-md rounded-lg">
                {/* Uploader Info */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-bg-secondary"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-6 w-3/4 bg-bg-secondary rounded"></div>
                        <div className="h-4 w-1/2 bg-bg-secondary rounded"></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mb-6">
                    <div className="h-12 w-full bg-bg-secondary rounded-lg"></div>
                    <div className="h-12 w-full bg-bg-secondary rounded-lg"></div>
                </div>

                {/* Model Details */}
                <div className="space-y-3">
                    <div className="h-5 w-full bg-bg-secondary rounded"></div>
                    <div className="h-5 w-5/6 bg-bg-secondary rounded"></div>
                    <div className="h-5 w-3/4 bg-bg-secondary rounded"></div>
                </div>
            </aside>
        </div>
    );
};
